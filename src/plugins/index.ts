// Plugin Registry — registers all built-in plugins
import { PluginService } from '../services/plugin/PluginService';
import { todoPlugin } from '../services/plugin/TodoPlugin';
import { calendarPlugin } from '../services/plugin/CalendarPlugin';
import { emailPlugin } from '../services/plugin/EmailPlugin';

export function registerBuiltinPlugins(): void {
  PluginService.register(todoPlugin);
  PluginService.register(calendarPlugin);
  PluginService.register(emailPlugin);
}

export { PluginService } from '../services/plugin/PluginService';
export { PluginPanel } from '../components/Plugin/PluginPanel';
