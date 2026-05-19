/**
 * AVATAR ASSETS
 *
 * Maps avatar IDs to their image sources.
 * The user should place 10 PNG avatar images in:
 *   assets/images/avatars/avatar1.png … avatar10.png
 *
 * Also exports the old emoji avatar values for migration.
 */

export const AVATARS = [
  { id: 'avatar1', source: require('../assets/images/avatars/avatar1.png') },
  { id: 'avatar2', source: require('../assets/images/avatars/avatar2.png') },
  { id: 'avatar3', source: require('../assets/images/avatars/avatar3.png') },
  { id: 'avatar4', source: require('../assets/images/avatars/avatar4.png') },
  { id: 'avatar5', source: require('../assets/images/avatars/avatar5.png') },
  { id: 'avatar6', source: require('../assets/images/avatars/avatar6.png') },
  { id: 'avatar7', source: require('../assets/images/avatars/avatar7.png') },
  { id: 'avatar8', source: require('../assets/images/avatars/avatar8.png') },
  { id: 'avatar9', source: require('../assets/images/avatars/avatar9.png') },
  { id: 'avatar10', source: require('../assets/images/avatars/avatar10.png') },
];

/** Legacy emoji avatars stored by earlier versions of the app.
 *  Used in UserContext to migrate old data to the new image-based system. */
export const OLD_EMOJI_AVATARS = ['💪', '🏋️', '🦍', '🔥', '⚡', '🏆', '🥇', '🎯', '🦁', '🦅'];
