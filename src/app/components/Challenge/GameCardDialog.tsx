import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import type { DnclEditorProps } from '@/app/types';
import { gameCardStatement, gameDirections, type GameCard } from './gameCards';

export function GameCardDialog(props: DnclEditorProps) {
  const [card, setCard] = useState<GameCard>(props.item?.gameCard ?? { kind: 'move' });
  const close = () => props.setEditor?.(previous => ({ ...previous, open: false }));
  const save = () => {
    if (!props.item) return;
    const item = { ...props.item, gameCard: card, ...gameCardStatement(card), formData: {} };
    if (props.isEdit) props.editItem?.({ editedItem: item, itemId: item.id });
    else props.addItem?.({ newItem: item, overIndex: props.overIndex });
    close();
  };
  return (
    <Dialog open={props.open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>ゲームのカード{props.isEdit ? 'を編集' : 'を追加'}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>{gameCardStatement(card).line}</Typography>
        {card.kind === 'turn' && (
          <TextField select fullWidth label="向く方向" value={card.direction}
            onChange={event => {
              const direction = gameDirections.find(value => value === event.target.value);
              if (direction) setCard({ kind: 'turn', direction });
            }}>
            {gameDirections.map(direction => <MenuItem key={direction} value={direction}>{direction}</MenuItem>)}
          </TextField>
        )}
        {card.kind === 'repeat' && (
          <TextField select fullWidth label="繰り返し回数" value={card.count}
            onChange={event => setCard({ kind: 'repeat', count: Number(event.target.value) })}>
            {Array.from({ length: 30 }, (_, i) => <MenuItem key={i + 1} value={i + 1}>{i + 1}回</MenuItem>)}
          </TextField>
        )}
        {(card.kind === 'if' || card.kind === 'while') && (
          <TextField select fullWidth label="目の前の壁" value={String(card.wall)}
            onChange={event => setCard({ kind: card.kind, wall: event.target.value === 'true' })}>
            <MenuItem value="true">壁がある</MenuItem>
            <MenuItem value="false">壁がない</MenuItem>
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>キャンセル</Button>
        <Button onClick={save} variant="contained">{props.isEdit ? '更新' : '追加'}</Button>
      </DialogActions>
    </Dialog>
  );
}
