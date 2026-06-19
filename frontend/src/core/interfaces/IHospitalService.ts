import { Hospital } from '../../types';

export interface IHospitalService {
  getHospitals(): Promise<Hospital[]>;
  updateHospitalBeds(id: string, bedsAvailable: number): Promise<Hospital>;
}
