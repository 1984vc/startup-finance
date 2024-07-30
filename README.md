# 1984 Startup Finance

This repository builds a set of startup finance applications and libraries:

1. The SAFE Conversion Worksheet App
2. The scripts used by our SAFE Conversion Google sheet

# SAFE Conversion worksheet (React app)

[SAFE Conversion Worksheet App](https://1984.vc/startup-finance/safe-conversion)

This app is 100% client-side, and allows you to quickly model what your Cap table would look like in a variety of scenarios.

Goals:
1. Users should be able to enter in their cap table details and model different fundraising scenarios.
2. Users can share this cap table with co-founders and investors easily and securely.

## How to share a worksheet

To share your worksheet, click the "Save" button and copy the URL. This contains all your cap table data, so you can share it freely
with co-founders or other investors.

### How data is stored

We don't store any data in the backend. Instead we serialize the state of the worksheet and hold it in the URL hash.
This allows you to quickly share a spreadsheet, but not worry about permissions (people you share this with get a snapshot of
the current state but won't recieve updates)

# SAFE Conversion Google Sheet

If you're more comforable with a spreadsheet, we offer this script as a Google Apps Script, which you can use here:

[Latest SAFE Conversion Google Sheet](https://docs.google.com/spreadsheets/d/1eunUazlR9qeNVkH29ihF9MCrLtmBNAANByzck2HceX4/edit?usp=sharing)

## Why

While it's possible to do circular references to solve SAFE conversion inside of Google Sheets, it's easy to
mess up the calculations and it's not easy to test. Alternatives, like Carta's tool, are closed source and very tied to sales.

At 1984 we believe SAFEs should be easy to understand and model, and the tools for that should be open source, well-tested, and
easy for anyone to use.

## Development

### React App

1. Clone the repo
1. Install node modules - `yarn install`
1. Run the development server - `yarn dev`
1. Visit the localhost server at http://localhost:3000/startup-finance/safe-conversion

## Testing / Linting / Staging

This library is tested using Jest, which you can run with `yarn test`

ESLint is used to keep the styling and lint for common errors, run lint with `yarn run lint`

Any commits push to staging will automatically get deployed to our staging worksheet, which you can find
[here](https://docs.google.com/spreadsheets/d/1d34sADQwY_wv0qw01KDclKl2i0IRLG1hC1SvCb5EpHg)


### Deployment of Google Apps Script

Process:

1. Update the version in `package.json`
2. Update `CHANGELOG.md` to reflect the latest additions and changes
3. Tag the release vX.X.X and push to Github.

Github Actions handle the deployment, which consists of the following steps

1. Lint
2. Test
3. Build
4. Deploy via the Google [Clasp CLI](https://developers.google.com/apps-script/guides/clasp)

## Credit

- [Ian Sanders (@iansan5653)](https://github.com/iansan5653) For creating his
  [Google App Script Template](https://github.com/iansan5653/gas-ts-template/generate) which this is based on.
- [Eric Anastas (@ericanastas)](https://github.com/ericanastas) For the
  [Google Apps Script Github Action](https://github.com/ericanastas/deploy-google-app-script-action)
