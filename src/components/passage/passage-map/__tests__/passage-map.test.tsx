import {
	createEvent,
	fireEvent,
	render,
	screen,
	within
} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {fakePassage} from '../../../../test-util';
import {PassageMap, PassageMapProps} from '../passage-map';

jest.mock('../../../../store/use-format-reference-parser');
jest.mock('../../passage-connections/passage-connections');
jest.mock('../../passage-card-group');

describe('<PassageMap>', () => {
	function renderComponent(props?: Partial<PassageMapProps>) {
		const passages = [fakePassage(), fakePassage()];

		return render(
			<PassageMap
				formatName=""
				formatVersion=""
				onDeselect={jest.fn()}
				onDrag={jest.fn()}
				onEdit={jest.fn()}
				onMiddleClick={jest.fn()}
				onSelect={jest.fn()}
				passages={passages}
				startPassageId={passages[0].id}
				tagColors={{}}
				visibleZoom={1}
				zoom={1}
				{...props}
			/>
		);
	}

	it('renders a <PassageConnections> for the passages', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages, startPassageId: passages[0].id});
		expect(
			screen.getByTestId(
				`mock-passage-connections-${passages[0].name}-${passages[1].name}`
			)
		).toBeInTheDocument();
	});

	it('renders a <PassageCardGroup> for the passages', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages, startPassageId: passages[0].id});
		expect(
			screen.getByTestId(
				`mock-passage-card-group-${passages[0].name}-${passages[1].name}`
			)
		).toBeInTheDocument();
	});

	it('changes the offset on <PassageConnections> when a drag occurs', () => {
		const passages = [fakePassage(), fakePassage()];

		renderComponent({passages, startPassageId: passages[0].id});
		fireEvent.click(
			within(
				screen.getByTestId(
					`mock-passage-card-group-${passages[0].name}-${passages[1].name}`
				)
			).getByText('simulate drag')
		);

		const connections = screen.getByTestId(
			`mock-passage-connections-${passages[0].name}-${passages[1].name}`
		);

		expect(connections.dataset.offsetLeft).toBe('5');
		expect(connections.dataset.offsetTop).toBe('10');
	});

	it('adds a compact-passage-cards class if the visible zoom level is equal to or below 0.6', () => {
		renderComponent({visibleZoom: 0.6});
		expect(
			document
				.querySelector('.passage-map')
				?.classList.contains('compact-passage-cards')
		).toBe(true);
	});

	it('does not add a compact-passage-cards class if the visible zoom level is above 0.6', () => {
		renderComponent({visibleZoom: 0.61});
		expect(
			document
				.querySelector('.passage-map')
				?.classList.contains('compact-passage-cards')
		).toBe(false);
	});

	it('sets itself as larger than the passage cards it contains', () => {
		const passages = [
			fakePassage({top: 10, left: 20, width: 100, height: 200}),
			fakePassage({top: 30, left: 40, width: 150, height: 250})
		];
		renderComponent({passages});
		const containerStyle = (
			document.querySelector('.passage-map') as HTMLElement
		).style;

		expect(containerStyle.height).toBe('calc(280px + 50vh)');
		expect(containerStyle.width).toBe('calc(190px + 50vw)');
	});

	it('does not call onSelect when a drag has just finished', () => {
		const onSelect = jest.fn();
		const passages = [fakePassage(), fakePassage()];

		renderComponent({onSelect, passages, startPassageId: passages[0].id});
		fireEvent.click(
			within(
				screen.getByTestId(
					`mock-passage-card-group-${passages[0].name}-${passages[1].name}`
				)
			).getByText('simulate drag')
		);
		expect(onSelect).not.toBeCalled();
	});

	it('calls the onMiddleClick prop when the user middle-clicks the component', () => {
		const passage = fakePassage({name: 'test'});
		const onMiddleClick = jest.fn();

		renderComponent({onMiddleClick, passages: [passage]});

		const target = screen.getByTestId('mock-passage-connections-test');

		expect(onMiddleClick).not.toBeCalled();
		fireEvent(target, createEvent.mouseUp(target, {button: 1}));
		expect(onMiddleClick.mock.calls).toEqual([[{top: 0, left: 0}]]);
	});

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
