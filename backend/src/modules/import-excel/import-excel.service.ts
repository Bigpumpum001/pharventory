import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateImportExcelDto,
  ConfirmImportDto,
  ImportType,
  ExcelRowData,
} from './dto/create-import-excel.dto';
import { UpdateImportExcelDto } from './dto/update-import-excel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Category } from '../category/entities/category.entity';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import * as XLSX from 'xlsx';
import { Unit } from '../units/entities/unit.entity';

@Injectable()
export class ImportExcelService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepo: Repository<Medicine>,
    @InjectRepository(MedicineBatch)
    private medicineBatchRepo: Repository<MedicineBatch>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
    private redisService: RedisService,
  ) {}

  async parseExcelFile(
    file: { buffer: Buffer } | undefined,
    importType: ImportType,
  ): Promise<{
    cacheKey: string;
    data: ExcelRowData[];
    existingNames: Set<string>;
  }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      type RawExcelRow = {
        [key: string]: unknown;
        name?: string;
        Name?: string;
        generic_name?: string;
        Generic_Name?: string;
        categoryId?: number | string;
        CategoryId?: number | string;
        category_id?: number | string;
        unit?: string;
        Unit?: string;
        price?: number | string;
        Price?: number | string;
        supplier?: string;
        Supplier?: string;
        batch_number?: string;
        Batch_Number?: string;
        quantity?: number | string;
        Quantity?: number | string;
        expiry_date?: string;
        Expiry_Date?: string;
      };

      const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet);

      const parsedData: ExcelRowData[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        let categoryId = 0;
        if (row.categoryId) {
          categoryId = parseInt(String(row.categoryId)) || 0;
        } else if (row.CategoryId) {
          categoryId = parseInt(String(row.CategoryId)) || 0;
        } else if (row.category_id) {
          categoryId = parseInt(String(row.category_id)) || 0;
        }

        let unitId = 0;
        const unitName =
          (row.unit as string) || (row.Unit as string) || undefined;
        if (unitName) {
          const unit = await this.unitRepo.findOne({
            where: { name: unitName },
          });
          unitId = unit?.id || 0;
        }

        parsedData.push({
          name: String(row.name || row.Name || ''),
          generic_name: String(row.generic_name || row.Generic_Name || ''),
          categoryId,
          unitId,
          price:
            row.price || row.Price
              ? parseFloat(String(row.price || row.Price))
              : undefined,
          supplier:
            (row.supplier as string) || (row.Supplier as string) || undefined,
          batch_number:
            (row.batch_number as string) ||
            (row.Batch_Number as string) ||
            undefined,
          quantity:
            row.quantity || row.Quantity
              ? parseInt(String(row.quantity || row.Quantity))
              : undefined,
          expiry_date:
            (row.expiry_date as string) ||
            (row.Expiry_Date as string) ||
            undefined,
        });
      }

      if (parsedData.length === 0) {
        throw new BadRequestException('No data found in Excel file');
      }

      // Filter by import type
      const filteredData = this.filterByImportType(parsedData, importType);

      // Get existing medicine names
      const existingNames = await this.getExistingMedicineNames();

      // Generate cache key and store in Redis
      const cacheKey = `import_excel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.redisService.set(
        cacheKey,
        JSON.stringify(filteredData),
        3600, // 1 hour expiry
      );

      return { cacheKey, data: filteredData, existingNames };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to parse Excel file: ${errorMessage}`,
      );
    }
  }

  private filterByImportType(
    data: ExcelRowData[],
    importType: ImportType,
  ): ExcelRowData[] {
    return data.map((row) => {
      const filtered: ExcelRowData = {
        name: row.name,
        categoryId: row.categoryId,
        unitId: row.unitId,
      };

      if (
        importType === ImportType.MEDICINE_AND_BATCH ||
        importType === ImportType.MEDICINE_ONLY
      ) {
        filtered.generic_name = row.generic_name;
        filtered.price = row.price;
        filtered.supplier = row.supplier;
      }

      if (
        importType === ImportType.MEDICINE_AND_BATCH ||
        importType === ImportType.BATCH_ONLY
      ) {
        filtered.batch_number = row.batch_number;
        filtered.quantity = row.quantity;
        filtered.expiry_date = row.expiry_date;
      }

      return filtered;
    });
  }

  private async getExistingMedicineNames(): Promise<Set<string>> {
    const medicines = await this.medicineRepo.find({ select: ['name'] });
    return new Set(medicines.map((m) => m.name.toLowerCase()));
  }

  async confirmImport(confirmDto: ConfirmImportDto): Promise<{
    created: string[];
    updated: string[];
    errors: Array<{ name: string; error: string }>;
  }> {
    const { importType, selectedRows, cacheKey } = confirmDto;

    // Get data from Redis
    const cachedData = await this.redisService.get(cacheKey);
    if (!cachedData) {
      throw new NotFoundException('Cache data not found or expired');
    }

    let allData: ExcelRowData[];
    try {
      allData = JSON.parse(cachedData) as ExcelRowData[];
    } catch {
      throw new BadRequestException('Invalid cache data format');
    }
    const selectedData = selectedRows
      .map((idx) => allData[idx])
      .filter((item) => item !== undefined);

    const existingNames = await this.getExistingMedicineNames();
    const results: {
      created: string[];
      updated: string[];
      errors: Array<{ name: string; error: string }>;
    } = {
      created: [],
      updated: [],
      errors: [],
    };

    for (const row of selectedData) {
      try {
        const medicineExists = existingNames.has(row.name.toLowerCase());

        if (importType === ImportType.MEDICINE_AND_BATCH) {
          if (medicineExists) {
            // Update medicine and add batch
            await this.addBatchToExistingMedicine(row);
            results.updated.push(row.name);
          } else {
            // Create new medicine with batch
            await this.createMedicineWithBatch(row);
            results.created.push(row.name);
          }
        } else if (importType === ImportType.MEDICINE_ONLY) {
          if (!medicineExists) {
            // Create new medicine only
            await this.createMedicineOnly(row);
            results.created.push(row.name);
          }
        } else if (importType === ImportType.BATCH_ONLY) {
          if (medicineExists) {
            // Add batch to existing medicine
            await this.addBatchToExistingMedicine(row);
            results.updated.push(row.name);
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({ name: row.name, error: errorMessage });
      }
    }

    // Clean up Redis cache
    await this.redisService.delete(cacheKey);

    return results;
  }

  private async createMedicineWithBatch(row: ExcelRowData): Promise<Medicine> {
    const medicineData: Partial<Medicine> & { category?: Category } = {
      name: row.name,
      genericName: row.generic_name || undefined,
      price: row.price,
      supplier: row.supplier,
    };

    if (row.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: row.categoryId },
      });
      if (category) {
        medicineData.category = category;
      }
    }
    if (row.unitId) {
      const unit = await this.unitRepo.findOne({
        where: { id: row.unitId },
      });
      if (unit) {
        medicineData.unit = unit;
      }
    }
    const medicine = this.medicineRepo.create(medicineData);
    const savedMedicine = await this.medicineRepo.save(medicine);

    if (row.batch_number && row.quantity !== undefined && row.expiry_date) {
      const batch = this.medicineBatchRepo.create({
        medicine: savedMedicine,
        batchNumber: row.batch_number,
        quantity: row.quantity,
        expiryDate: new Date(row.expiry_date),
      });
      await this.medicineBatchRepo.save(batch);
    }

    return savedMedicine;
  }

  private async createMedicineOnly(row: ExcelRowData): Promise<Medicine> {
    const medicineData: Partial<Medicine> & { category?: Category } = {
      name: row.name,
      genericName: row.generic_name || undefined,
      price: row.price,
      supplier: row.supplier,
    };

    if (row.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: row.categoryId },
      });
      if (category) {
        medicineData.category = category;
      }
    }
    if (row.unitId) {
      const unit = await this.unitRepo.findOne({
        where: { id: row.unitId },
      });
      if (unit) {
        medicineData.unit = unit;
      }
    }

    const medicine = this.medicineRepo.create(medicineData);
    return await this.medicineRepo.save(medicine);
  }

  private async addBatchToExistingMedicine(row: ExcelRowData): Promise<void> {
    if (!row.batch_number || row.quantity === undefined || !row.expiry_date) {
      throw new BadRequestException('Batch information is incomplete');
    }

    const medicine = await this.medicineRepo.findOne({
      where: { name: row.name },
    });
    if (!medicine) {
      throw new NotFoundException(`Medicine ${row.name} not found`);
    }

    const batch = this.medicineBatchRepo.create({
      medicine,
      batchNumber: row.batch_number,
      quantity: row.quantity,
      expiryDate: new Date(row.expiry_date),
    });

    await this.medicineBatchRepo.save(batch);
  }

  create(createImportExcelDto: CreateImportExcelDto) {
    void createImportExcelDto; // Suppress unused variable warning
    return 'This action adds a new importExcel';
  }

  findAll() {
    return `This action returns all importExcel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} importExcel`;
  }

  update(_id: number, updateImportExcelDto: UpdateImportExcelDto) {
    // Method not yet implemented - placeholder for future use
    void updateImportExcelDto; // Suppress unused variable warning
    return `This action updates a #${_id} importExcel`;
  }

  remove(id: number) {
    return `This action removes a #${id} importExcel`;
  }
}
