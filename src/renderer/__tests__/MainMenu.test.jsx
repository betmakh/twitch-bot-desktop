import React from 'react';
// import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';

import MainMenu from '../components/MainMenu';
import EnzymeAdapter from '../utils/EnzymeConfig';

test('Main menu renders correctly', () => {
	const component = shallow(<MainMenu />);
	// const component = renderer.create(<MainMenu />);
	// let tree = component.toJSON();
	expect(component).toMatchSnapshot();
});
