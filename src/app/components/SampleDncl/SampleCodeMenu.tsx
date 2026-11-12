"use client";

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { TreeItems } from '@/app/types';
import { EditorSample, editorSamples } from './editorSamples';

type Props = {
  treeItems: TreeItems;
  onSelect: (items: TreeItems) => void;
};

export function SampleCodeMenu({ treeItems, onSelect }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [pendingSample, setPendingSample] = useState<EditorSample | null>(null);

  const handleSelect = (sample: EditorSample) => {
    setAnchorEl(null);
    if (treeItems.length > 0) {
      setPendingSample(sample);
      return;
    }
    onSelect(sample.createItems());
  };

  const handleReplace = () => {
    if (!pendingSample) return;
    onSelect(pendingSample.createItems());
    setPendingSample(null);
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{ backgroundColor: 'var(--stone-50)', marginLeft: 'auto', color: 'var(--foreground)' }}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
      >
        サンプルコード
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {editorSamples.map(sample => (
          <MenuItem key={sample.id} onClick={() => handleSelect(sample)}>
            <span>
              <Typography component="span" display="block">
                {sample.title}
              </Typography>
              <Typography component="span" variant="caption" color="text.secondary">
                {sample.description}
              </Typography>
            </span>
          </MenuItem>
        ))}
      </Menu>
      <Dialog
        open={pendingSample !== null}
        onClose={() => setPendingSample(null)}
        aria-labelledby="sample-replace-title"
      >
        <DialogTitle id="sample-replace-title">サンプルコードをセット</DialogTitle>
        <DialogContent>
          現在のプログラムを「{pendingSample?.title}」に置き換えます。未保存の編集内容は失われます。
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingSample(null)}>キャンセル</Button>
          <Button onClick={handleReplace} variant="contained">置き換える</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
