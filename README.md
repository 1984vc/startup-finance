![image](https://github.com/1984vc/StartupFinanceScripts/assets/2868/f1423f8a-d63c-43bb-b644-51378eb39d75)

# 1984 Startup Finance Scripts

This repository builds the finance Apps Script used by 1984's SAFE Conversion Worksheet

[SAFE Conversion Google Sheet](https://docs.google.com/spreadsheets/d/1eunUazlR9qeNVkH29ihF9MCrLtmBNAANByzck2HceX4/edit?usp=sharing)

## Why

While it's possible to do circular references to solve SAFE conversion inside of Google Sheets, it's easy to
mess up the calculations and it's not easy to test.

This library allows the user to customize the spreadsheet for their own purposes while allowing us to test the
library programatically.

## Deployment

Process:

1. Update the version in `package.json`
2. Update `CHANGELOG.md` to reflect the latest additions and changes
3. Tag the release vX.X.X and push to Github.

Github Actions handle the deployment, which consists of the following steps

1. Lint
2. Test
3. Build
4. Deploy via the Google [Clasp CLI](https://developers.google.com/apps-script/guides/clasp)

## Testing / Linting / Staging

This library is tested using Jest, which you can run with `npm test`

ESLint is used to keep the styling and lint for common errors, run lint with `npm run lint`

Any commits push to staging will automatically get deployed to our staging worksheet, which you can find
[here](https://docs.google.com/spreadsheets/d/1d34sADQwY_wv0qw01KDclKl2i0IRLG1hC1SvCb5EpHg)

## Credit

- [Ian Sanders (@iansan5653)](https://github.com/iansan5653) For creating his
  [Google App Script Template](https://github.com/iansan5653/gas-ts-template/generate) which this is based on.
- [Eric Anastas (@ericanastas)](https://github.com/ericanastas) For the
  [Google Apps Script Github Action](https://github.com/ericanastas/deploy-google-app-script-action)
