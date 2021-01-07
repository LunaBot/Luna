// import { createVueEndpoint } from '@/utils';
import router from 'express-promise-router';
// import Vue from 'vue';

const autoRole = router();

// AutoRole settings
// autoRole.get('/dashboard/:serverId/modules/auto-role', (request, response) => {
//     return createVueEndpoint({
//         app: new Vue({
//             template: `
//                 <form action="/">
//                     <label for="fname">Roles:</label><input type="text" id="roles" name="roles"><br><br>
//                     <label for="lname">Last name:</label><input type="text" id="lname" name="lname"><br><br>
//                     <input type="submit" value="Save">
//                 </form>
//             `,
//         }),
//         context: {
//             title: 'Automod - AutoRole - Settings',
//         }
//     })(request, response);
// });

// Handle form
// autoRole.post();

export {
    autoRole
};
