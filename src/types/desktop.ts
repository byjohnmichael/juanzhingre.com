export interface Icon {
  id: string;
  name: string;
  type: 'app' | 'folder' | 'file';
  position: { x: number; y: number };
  icon: string;
  color: string;
  action?: () => void;
}

export interface Window {
  id: string;
  title: string;
  type: 'app' | 'folder' | 'game';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isOpen: boolean;
  zIndex: number;
  content?: React.ReactNode;
}

export interface DesktopState {
  icons: Icon[];
  windows: Window[];
  activeWindowId: string | null;
  background: string;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  component: React.ComponentType<any>;
}
