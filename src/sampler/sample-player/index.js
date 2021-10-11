'use strict'

import { default as player } from './player.js';
import events from './events.js';
import notes from './notes.js';
import scheduler from './scheduler.js';

export function SamplePlayer(ac, source, options) {
  return scheduler(notes(events(player(ac, source, options))))
}

if (typeof module === 'object' && module.exports) module.exports = SamplePlayer
if (typeof window !== 'undefined') window.SamplePlayer = SamplePlayer
