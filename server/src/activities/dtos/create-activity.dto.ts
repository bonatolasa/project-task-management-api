export class CreateActivityDto {
  actionType: string;
  performedBy: string;
  targetId?: string;
  description: string;
}
