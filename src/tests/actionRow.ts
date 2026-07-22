import { actionRow, button } from '../../build';

const x = button().primary().customId('get_tags').label('Get Tags');
console.log(actionRow(x).toJSON());
