import { useEffect } from 'react';

interface KeyboardShortcut {
  altKey?: boolean;
  ctrlKey?: boolean;
  description: string;
  handler: (event: KeyboardEvent) => void;
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Custom hook to register keyboard shortcuts for better accessibility
 * @param shortcuts Array of keyboard shortcuts to register
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      /* Don't trigger shortcuts when typing in inputs */
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const shiftMatches =
          shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Get list of all registered keyboard shortcuts for help display
 */
export function getShortcutDescription(shortcuts: KeyboardShortcut[]): string[] {
  return shortcuts.map((shortcut) => {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push('Ctrl');
    if (shortcut.metaKey) modifiers.push('Cmd');
    if (shortcut.altKey) modifiers.push('Alt');
    if (shortcut.shiftKey) modifiers.push('Shift');

    const key = shortcut.key.toUpperCase();
    const combo = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;

    return `${combo}: ${shortcut.description}`;
  });
}
