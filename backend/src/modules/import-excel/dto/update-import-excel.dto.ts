import { PartialType } from '@nestjs/mapped-types';
import { CreateImportExcelDto } from './create-import-excel.dto';

export class UpdateImportExcelDto extends PartialType(CreateImportExcelDto) {}
