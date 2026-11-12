import { Box } from '@mui/material';
import type { CharacterDirection } from './dnclCharacterGame';
import styles from './GameCharacter.module.css';

export function GameCharacter({ direction, walking }: { direction: CharacterDirection; walking: boolean }) {
  const image = direction === '上' ? 'back' : direction === '下' ? 'front' : 'side';
  return (
    <Box
      role="img"
      aria-label={`${direction}向きの女の子（${walking ? '歩行中' : '待機中'}）`}
      className={`${styles.sprite} ${walking ? styles.walking : ''}`}
      sx={{
        backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH || ''}/game-character-${image}.webp")`,
        transform: direction === '右' ? 'scaleX(-1)' : undefined,
      }}
    />
  );
}
