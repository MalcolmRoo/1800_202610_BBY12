// This Vite config file (vite.config.js) tells Rollup (production bundler)
// to treat multiple HTML files as entry points so each becomes its own built page.

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        main: resolve(__dirname, "main.html"),
        createGrpForm: resolve(__dirname, "createGrpForm.html"),
        JoinGroup: resolve(__dirname, "JoinGroup.html"),
        myGroups: resolve(__dirname, "myGroups.html"),
        group: resolve(__dirname, "group.html"),
        MyAccount: resolve(__dirname, "Slide-Out-Menu/MyAccount.html"),
        settings: resolve(__dirname, "Slide-Out-Menu/settings.html"),
        report: resolve(__dirname, "report.html"),
      },
    },
  },
});
