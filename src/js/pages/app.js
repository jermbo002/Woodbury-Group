/**
 * Copyright 2022 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
 */
import Bootstrap from '../utils/bootstrap/';

// Expose toast and alert to entire app with import here
// import toast from '../components/toast';
// import alert from '../components/alert';

class App extends Bootstrap {
    constructor() {
        super();

        // Expose the imported toast and alert element to app
        // this.toast = toast;
        // this.alert = alert;
    }
}

export default new App();