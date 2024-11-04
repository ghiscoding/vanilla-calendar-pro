import createLayouts from '@scripts/creators/createLayouts';
import setMonthOrYearModifier from '@scripts/creators/setMonthOrYearModifier';
import visibilityTitle from '@scripts/creators/visibilityTitle';
import getDate from '@scripts/utils/getDate';
import type { VanillaCalendarPro } from '@src/index';

const relationshipID = (self: VanillaCalendarPro) => {
  if (self.viewType !== 'multiple') return 0;
  const columnEls = self.private.mainElement.querySelectorAll<HTMLElement>('[data-vc="column"]');
  const indexColumn = Array.from(columnEls).findIndex((column) => column.closest('[data-vc-column="month"]'));
  return indexColumn > 0 ? indexColumn : 0;
};

const createMonthEl = (
  self: VanillaCalendarPro,
  templateEl: HTMLButtonElement,
  selected: number,
  titleShort: string,
  titleLong: string,
  disabled: boolean,
  id: number,
) => {
  const monthEl = templateEl.cloneNode(false) as HTMLButtonElement;
  monthEl.className = self.styles.monthsMonth;
  monthEl.innerText = titleShort;
  monthEl.ariaLabel = titleLong;
  monthEl.role = 'gridcell';
  monthEl.dataset.vcMonthsMonth = `${id}`;
  if (disabled) monthEl.ariaDisabled = 'true';
  if (disabled) monthEl.tabIndex = -1;
  monthEl.disabled = disabled;
  setMonthOrYearModifier(self, monthEl, 'month', selected === id, false);
  return monthEl;
};

const createMonths = (self: VanillaCalendarPro, target?: HTMLElement) => {
  const yearEl = target?.closest('[data-vc="header"]')?.querySelector<HTMLElement>('[data-vc="year"]');
  const selectedYear = yearEl ? Number(yearEl.dataset.vcYear) : (self.private.selectedYear as number);
  const selectedMonth = target?.dataset.vcMonth ? Number(target.dataset.vcMonth) : self.private.selectedMonth;

  self.private.currentType = 'month';
  createLayouts(self, target);
  visibilityTitle(self);

  const monthsEl = self.private.mainElement.querySelector('[data-vc="months"]');
  if (!self.selectionMonthsMode || !monthsEl) return;

  const activeMonthsID =
    self.monthsToSwitch > 1
      ? self.private.locale.months.long
          .map((_, i) => selectedMonth - self.monthsToSwitch * i)
          .concat(self.private.locale.months.long.map((_, i) => selectedMonth + self.monthsToSwitch * i))
          .filter((monthID) => monthID >= 0 && monthID <= 12)
      : Array.from(Array(12).keys());

  const templateMonthEl = document.createElement('button');
  templateMonthEl.type = 'button';

  for (let i = 0; i < 12; i++) {
    const dateMin = getDate(self.private.dateMin);
    const dateMax = getDate(self.private.dateMax);

    const monthDisabled =
      (i < dateMin.getMonth() + relationshipID(self) && selectedYear <= dateMin.getFullYear()) ||
      (i > dateMax.getMonth() + relationshipID(self) && selectedYear >= dateMax.getFullYear()) ||
      (i !== selectedMonth && !activeMonthsID.includes(i));
    const monthEl = createMonthEl(
      self,
      templateMonthEl,
      selectedMonth,
      self.private.locale.months.short[i],
      self.private.locale.months.long[i],
      monthDisabled,
      i,
    );
    monthsEl.appendChild(monthEl);
    if (self.onCreateMonthEls) self.onCreateMonthEls(self, monthEl);
  }

  self.private.mainElement.querySelector<HTMLElement>(`[data-vc-months-month]`)?.focus();
};

export default createMonths;
