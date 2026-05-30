import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

// Mock the store
vi.mock('../../store', () => ({
  useStore: vi.fn((selector) => {
    if (selector === 'activePanel') return 'chat';
    if (selector === 'setActivePanel') return vi.fn();
    if (selector === 'setActivePluginId') return vi.fn();
    return undefined;
  }),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock MUI替代 entirely
vi.mock('../MUI替代', () => ({
  MyIconButton: 'button',
  MyTooltip: ({ children }: any) => <div>{children}</div>,
}));

// Mock ui/muiIconMap - provide ALL icons to avoid undefined
const AllIcons = () => <span>icon</span>;
vi.mock('../ui/muiIconMap', () => ({
  ChatIcon: AllIcons, CalendarMonthIcon: AllIcons, CheckBoxIcon: AllIcons,
  DescriptionIcon: AllIcons, EmailIcon: AllIcons, EditIcon: AllIcons,
  SettingsIcon: AllIcons, GroupIcon: AllIcons, PsychologyIcon: AllIcons,
  ExtensionIcon: AllIcons, MemoryIcon: AllIcons, BarChartIcon: AllIcons,
  HubIcon: AllIcons, ScenesIcon: AllIcons, FlashOnIcon: AllIcons,
  MultiAgentIcon: AllIcons, ChevronLeftIcon: AllIcons, ChevronRightIcon: AllIcons,
  ActivityIcon: AllIcons, NetworkIcon: AllIcons,
}));

// Mock ui/Box
vi.mock('../ui/Box', () => ({
  Box: 'div',
}));

// Mock PersonaSelector - simple stub
vi.mock('../Persona/PersonaSelector', () => ({
  PersonaSelector: () => null,
}));

// Mock Agent/MultiAgentPanel
vi.mock('../Agent/MultiAgentPanel', () => ({
  MultiAgentPanel: () => null,
}));

// Mock PluginService
vi.mock('../../services/plugin/PluginService', () => ({
  PluginService: { getInstance: vi.fn(() => ({ getPlugins: () => [] })) },
}));

const renderSidebar = () => {
  render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderSidebar();
    expect(screen.getByText('PixelPal')).toBeTruthy();
  });

  it('renders navigation items in expanded state', () => {
    renderSidebar();
    expect(screen.getByText('nav.chat')).toBeTruthy();
    expect(screen.getByText('AI Companion')).toBeTruthy();
  });

  it('renders logo with PixelPal text', () => {
    renderSidebar();
    expect(screen.getByText('PixelPal')).toBeTruthy();
    expect(screen.getByText('AI Companion')).toBeTruthy();
  });

  it('renders logo with AI Companion subtitle', () => {
    renderSidebar();
    expect(screen.getByText('AI Companion')).toBeTruthy();
  });

  it('renders multiple navigation items', () => {
    renderSidebar();
    expect(screen.getByText('nav.chat')).toBeTruthy();
  });

  it('renders nav items in expanded sidebar', () => {
    renderSidebar();
    expect(screen.getByText('nav.memory')).toBeTruthy();
  });
});
