import { DEMO_MODE } from '../../config/appMode';
import { demoAIService } from './demo';
import { prodAIService } from './prod';
export const aiService = DEMO_MODE ? demoAIService : prodAIService;
export { demoAIService, prodAIService };
