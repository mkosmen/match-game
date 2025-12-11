import { Component, computed, signal, WritableSignal } from '@angular/core';
import shuffle from 'lodash.shuffle';
import { CommonModule } from '@angular/common';
import { sleep, getTimeOf } from '../../util';
import { RouterLink } from '@angular/router';

const CARD_COUNT = 18;

@Component({
  selector: 'app-game',
  imports: [CommonModule, RouterLink],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game {
  numberList = [...Array(CARD_COUNT).keys()];

  selectedOrder = signal(0);
  selectedIndexes: WritableSignal<[number | null, number | null]> = signal([null, null]);
  numbers = signal([...shuffle(this.numberList), ...shuffle(this.numberList)]);
  matchedIndexes: WritableSignal<number[]> = signal([]);
  locked = signal(false);
  totalAttempts = signal(0);
  timer: WritableSignal<number | null> = signal(null);
  time = signal(0);

  toTime = computed(() => {
    const { minute, second } = getTimeOf(this.time());
    return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  });

  ngOnInit() {
    this.timer.set(
      setInterval(() => {
        this.time.update((val) => val + 1);
      }, 1000)
    );
  }

  ngOnDestroy() {
    this.destroyTimer();
  }

  async onClickHandler(index: number) {
    const isSelected = this.isSelected(index);
    const isInMatched = this.isInMatched(index);

    if (this.locked() || isSelected || isInMatched) {
      return;
    }

    this.locked.set(true);

    if (this.selectedOrder() === 0) {
      this.selectedIndexes.set([index, null]);
    } else {
      this.totalAttempts.update((val) => val + 1);
      this.selectedIndexes.set([this.selectedIndexes()[0], index]);

      const isMatched = this.isMatched();
      if (isMatched) {
        this.matchedIndexes.update((val) => [
          ...val,
          ...(this.selectedIndexes() as [number, number]),
        ]);
      }

      const allSelected = this.checkAllSelected();
      if (allSelected) {
        this.destroyTimer();
        return;
      }

      await sleep();
      this.selectedIndexes.set([null, null]);
    }

    this.turnSelectedIndex();
    this.locked.set(false);
  }

  destroyTimer() {
    if (this.timer()) {
      clearInterval(this.timer()!);
    }
  }

  checkAllSelected() {
    return this.matchedIndexes().length === CARD_COUNT * 2;
  }

  turnSelectedIndex() {
    this.selectedOrder.update((val) => (val === 0 ? 1 : 0));
  }

  isSelected(index: number) {
    return this.selectedIndexes().includes(index);
  }

  selectedOff() {
    return this.selectedIndexes().every((f) => f !== null);
  }

  isInMatched(index: number) {
    return this.matchedIndexes().includes(index);
  }

  isMatched() {
    const selected1 = this.numbers()[this.selectedIndexes()[0]!];
    const selected2 = this.numbers()[this.selectedIndexes()[1]!];

    return selected1 === selected2;
  }

  timeOfGame() {
    const { minute, second } = getTimeOf(this.time());
    return !minute
      ? `${second} seconds`
      : !second
      ? `${minute > 1 ? 'minutes' : 'minute'}`
      : `${minute > 1 ? 'minutes' : 'minute'} and ${second > 1 ? 'seconds' : 'second'}`;
  }

  startGameAgain() {
    window.location.reload();
  }
}
