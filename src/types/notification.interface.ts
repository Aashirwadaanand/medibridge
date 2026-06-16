import { Document, Types } from 'mongoose';

export type NotificationType =
  | 'appointment'
  | 'medicine'
  | 'prescription'
  | 'followup'
  | 'emergency'
  | 'general';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
