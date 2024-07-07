import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {setupStore} from "./store";
import { setupElComponent } from "./plugins/ElComponent";

function setupApp() {
    const app = createApp(App)

    app.mount('#app')

    setupStore(app)

    setupElComponent(app)
}

setupApp()
