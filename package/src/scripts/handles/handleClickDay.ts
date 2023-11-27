import VanillaCalendar from '@src/vanilla-calendar';
import actionsInput from '@scripts/helpers/actionsInput';
import changeMonth from '@scripts/methods/changeMonth';
import createDays from '@scripts/methods/createDays';
import handleDayRangedSelection from '@scripts/handles/handleDayRangedSelection';
import handleDaySelection from '@scripts/handles/handleDaySelection';

const handleClickDay = (self: VanillaCalendar, event: MouseEvent) => {
	const element = event.target as HTMLElement;
	const closest = (className: string): HTMLElement | null => element.closest(`.${className}`);
	const dayBtnEl: HTMLElement | null = closest(self.CSSClasses.dayBtn);

	if (!self.settings.selection.day || !['single', 'multiple', 'multiple-ranged'].includes(self.settings.selection.day) || !dayBtnEl) return;

	const daySelectionActions = {
		single: () => handleDaySelection(self, dayBtnEl, false),
		multiple: () => handleDaySelection(self, dayBtnEl, false),
		'multiple-ranged': () => handleDayRangedSelection(self, dayBtnEl),
	};
	daySelectionActions[self.settings.selection.day]();
	self.selectedDates?.sort((a, b) => +new Date(a) - +new Date(b));

	if (self.actions.clickDay) self.actions.clickDay(event, self.selectedDates);

	const isInitAsInput = self.input && self.HTMLInputElement && self.HTMLElement;
	if (isInitAsInput && self.actions.changeToInput) {
		self.actions.changeToInput(
			event,
			actionsInput(self),
			self.selectedDates,
			self.selectedTime,
			self.selectedHours,
			self.selectedMinutes,
			self.selectedKeeping,
		);
	}

	const dayBtnPrevEl = closest(self.CSSClasses.dayBtnPrev);
	const dayBtnNextEl = closest(self.CSSClasses.dayBtnNext);

	const actionMapping = {
		prev: () => changeMonth(self, 'prev'),
		next: () => changeMonth(self, 'next'),
		default: () => createDays(self),
	};

	actionMapping[dayBtnPrevEl ? 'prev' : dayBtnNextEl ? 'next' : 'default']();
};

export default handleClickDay;