import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ImportExcelService } from './import-excel.service';
import {
  CreateImportExcelDto,
  ConfirmImportDto,
  ImportType,
} from './dto/create-import-excel.dto';
import { UpdateImportExcelDto } from './dto/update-import-excel.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/import-excel')
export class ImportExcelController {
  constructor(private readonly importExcelService: ImportExcelService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parseExcel(
    @UploadedFile() file: any,
    @Body() body: { importType: ImportType },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const { cacheKey, data, existingNames } =
      await this.importExcelService.parseExcelFile(file, body.importType);
    return {
      success: true,
      cacheKey,
      data: data.map((row, index) => ({
        index,
        ...row,
        isExists: existingNames.has(row.name.toLowerCase()),
      })),
      total: data.length,
    };
  }

  @Post('confirm')
  async confirmImport(@Body() confirmDto: ConfirmImportDto) {
    const result = await this.importExcelService.confirmImport(confirmDto);
    return {
      success: true,
      ...result,
    };
  }

  @Post()
  create(@Body() createImportExcelDto: CreateImportExcelDto) {
    return this.importExcelService.create(createImportExcelDto);
  }

  @Get()
  findAll() {
    return this.importExcelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importExcelService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImportExcelDto: UpdateImportExcelDto,
  ) {
    return this.importExcelService.update(+id, updateImportExcelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importExcelService.remove(+id);
  }
}
