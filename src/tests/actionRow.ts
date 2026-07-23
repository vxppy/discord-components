import { actionRow, button, ComponentType } from '../../src';

const x = button().primary().customId('get_tags').label('Get Tags');
console.log(actionRow(x).toJSON());

actionRow(x).Type == ComponentType.ActionRow;
