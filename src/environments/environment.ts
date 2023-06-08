// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // socketHost : 'https://dev.teleperson.com/',
  // apiHost : 'https://dev.teleperson.com/api/',
  // host : 'https://dev.teleperson.com/static/',
  plaidEnv :"sandbox",
  socketHost : 'https://app.teleperson.com/',
  apiHost : 'https://app.teleperson.com/api/',
  host : 'https://app.teleperson.com/static/',
  salt : 'teleperson',
  // socketHost : 'http://localhost:4422/',
  // apiHost : 'http://localhost:4422/api/',
  // host : 'http://localhost:4422/static/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
