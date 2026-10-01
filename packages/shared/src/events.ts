export const SOCKET_EVENTS = {
  // Client -> Server
  ROOM_READY_TOGGLE: 'room:ready_toggle',
  ROOM_START_MATCH: 'room:start_match',
  GAME_SELECT: 'game:select',
  GAME_MOVE: 'game:move',
  ROUND_NEXT: 'round:next',
  REMATCH_REQUEST: 'match:rematch_request',

  // Server -> Room / Client
  ROOM_STATE: 'room:state',
  ROOM_PLAYER_JOINED: 'room:player_joined',
  ROOM_PLAYER_LEFT: 'room:player_left',
  GAME_START: 'game:start',
  GAME_STATE: 'game:state',
  GAME_COMPLETE: 'game:complete',
  MATCH_SCORE_UPDATE: 'match:score_update',
  MATCH_COMPLETE: 'match:complete',
  ERROR: 'system:error',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
