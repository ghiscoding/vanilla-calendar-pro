import { FormatDateString } from '@package/types';
import VanillaCalendar from '@src/vanilla-calendar';
import getDateString from '@scripts/helpers/getDateString';
import getDate from '@scripts/helpers/getDate';
import parseDates from '@scripts/helpers/parseDates';
import create from '@scripts/create';

const current: {
	self: VanillaCalendar | null
	rangeMin: FormatDateString | undefined;
	rangeMax: FormatDateString | undefined;
} = {
	self: null,
	rangeMin: undefined,
	rangeMax: undefined,
};

const removeHoverEffect = () => {
	const dayEls = current.self?.HTMLElement?.querySelectorAll(`.${current.self.CSSClasses.dayBtnHover}`);
	dayEls?.forEach((d) => d.classList.remove((current.self as VanillaCalendar).CSSClasses.dayBtnHover));
};

const addHoverEffect = (day: Date) => {
	if (!current.self?.selectedDates) return;
	const formattedDate = getDateString(day);

	if (current.self.rangeDisabled?.includes(formattedDate)) return;

	const dayEls: NodeListOf<HTMLElement> | undefined = current.self.HTMLElement?.querySelectorAll(`[data-calendar-day="${formattedDate}"]`);
	dayEls?.forEach((d) => d.classList.add((current.self as VanillaCalendar).CSSClasses.dayBtnHover));
};

const handleHoverDaysEvent = (e: MouseEvent) => {
	if (!e.target || !current.self?.selectedDates) return;
	removeHoverEffect();

	const dayEl: HTMLElement | null = (e.target as HTMLElement).closest('[data-calendar-day]');
	if (!dayEl) return;

	const formattedDate = dayEl.dataset.calendarDay as FormatDateString;
	const startDate = getDate(current.self.selectedDates[0]);
	const endDate = getDate(formattedDate);
	const [start, end] = startDate < endDate ? [startDate, endDate] : [endDate, startDate];

	for (let i = new Date(start); i <= end; i.setDate(i.getDate() + 1)) {
		addHoverEffect(i);
	}
};

const handleCancelSelectionDays = (e: KeyboardEvent) => {
	if (!current.self || e.key !== 'Escape') return;
	current.self.selectedDates = [];
	(current.self.HTMLElement).removeEventListener('mousemove', handleHoverDaysEvent);
	document.removeEventListener('keydown', handleCancelSelectionDays);
	create(current.self);
};

const updateDisabledDates = () => {
	if (!current.self?.selectedDates?.[0] || !current.self.rangeDisabled || current.self.rangeDisabled?.length < 2) return;
	const selectedDate = getDate(current.self.selectedDates[0]);

	const [startDate, endDate] = current.self.rangeDisabled
		.map((dateStr) => getDate(dateStr))
		.reduce<[Date | null, Date | null]>(([start, end], disabledDate) => [
		selectedDate >= disabledDate ? disabledDate : start,
		selectedDate < disabledDate && end === null ? disabledDate : end,
	], [null, null]);

	if (startDate) current.self.rangeMin = getDateString(new Date(startDate.setDate(startDate.getDate() + 1)));
	if (endDate) current.self.rangeMax = getDateString(new Date(endDate.setDate(endDate.getDate() - 1)));
};

const resetDisabledDates = () => {
	if (!current.self) return;
	current.self.rangeMin = current.rangeMin as FormatDateString;
	current.self.rangeMax = current.rangeMax as FormatDateString;
};

const handleDayRangedSelection = (self: VanillaCalendar, formattedDate?: FormatDateString) => {
	if (formattedDate) {
		const selectedDateExists = self.selectedDates.length === 1 && self.selectedDates[0].includes(formattedDate);
		self.selectedDates = selectedDateExists && !self.settings.selection.cancelableDay
			? [formattedDate, formattedDate]
			: selectedDateExists && self.settings.selection.cancelableDay
				? []
				: self.selectedDates.length > 1 ? [formattedDate] : [...self.selectedDates, formattedDate];
		self.selectedDates?.sort((a, b) => +new Date(a) - +new Date(b));
	}

	if (self.settings.range.disableGaps) {
		current.rangeMin = current.rangeMin ? current.rangeMin : self.rangeMin;
		current.rangeMax = current.rangeMax ? current.rangeMax : self.rangeMax;
	}

	current.self = self;

	const selectionHandlers = {
		set: () => {
			self.HTMLElement.addEventListener('mousemove', handleHoverDaysEvent);
			document.addEventListener('keydown', handleCancelSelectionDays);
			if (self.settings.range.disableGaps) updateDisabledDates();
		},
		reset: () => {
			const [startDate, endDate] = [self.selectedDates[0], self.selectedDates[self.selectedDates.length - 1]];
			self.selectedDates = self.selectedDates[0] !== self.selectedDates[self.selectedDates.length - 1]
				? parseDates([`${startDate as string}:${endDate as string}`])
				: [self.selectedDates[0], self.selectedDates[0]];
			self.HTMLElement.removeEventListener('mousemove', handleHoverDaysEvent);
			document.removeEventListener('keydown', handleCancelSelectionDays);
			if (self.settings.range.disableGaps) resetDisabledDates();
		},
	};
	selectionHandlers[self.selectedDates.length === 1 ? 'set' : 'reset']();
};

export default handleDayRangedSelection;
