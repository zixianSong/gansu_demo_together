import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn([0, 1])
  status!: 0 | 1;
}
