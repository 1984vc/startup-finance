<p align="center"><img src="https://raw.githubusercontent.com/1984vc/website/main/static/images/github-logo.svg" width="100" align="center"></p>

# 1984 Startup Finance Library and Worksheet

### Why

At 1984 we believe SAFEs should be easy to understand and model, and the tools for that should be open source, well-tested, and
easy for anyone to use. Currently the best we have are either some aging Excel spreadsheets that get passed around, or a fairly 
rudimentary webapp.

The goal of this repository is to provide a tool for startup founders to quickly understand the decisions they make with regards to financing,
especially at the SAFE round.

Our primary project is the [Cap Table Worksheet Tool](https://1984.vc/docs/cap-table-worksheet), which you can find on our website at [https://1984.vc/docs/cap-table-worksheet/](https://1984.vc/docs/cap-table-worksheet)

## Technical Details

### SAFE Conversion worksheet (React app)

[SAFE Conversion Worksheet App](https://1984.vc/docs/cap-table-worksheet)

This app is 100% client-side, and allows you to quickly model what your Cap table would look like in a variety of scenarios.

Goals:
1. Users should be able to enter in their cap table details and model different fundraising scenarios.
2. Users can share this cap table with co-founders and investors easily and securely.

### How to share a worksheet

To share your worksheet, click the "Save" button and copy the URL. This contains all your cap table data, so you can share it freely
with co-founders or other investors.

### How data is stored

We don't store any data in the backend. Instead we serialize the state of the worksheet and hold it in the URL hash.
This allows you to quickly share a spreadsheet, without worrying about permissions (people you share this with get a snapshot of
the current state but won't recieve updates)

## SAFE Conversion Google Sheet

If you're more comforable with a spreadsheet, we offer this script as a Google Apps Script, which you can use here:

[Latest SAFE Conversion Google Sheet](https://docs.google.com/spreadsheets/d/1eunUazlR9qeNVkH29ihF9MCrLtmBNAANByzck2HceX4/edit?usp=sharing)


## Development / Contributing

### React App

1. Clone the repo
1. Install node modules - `yarn install`
1. Run the development server - `yarn dev`
1. Visit the localhost server at http://localhost:3000/startup-finance/safe-conversion

### Testing / Linting / Staging

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

# License

The code located at `src/library` is licensed under MIT, feel free to do with it as you please. Because the React app is very styled to the 1984 brand we are not licensing it, but providing the code as open source in order to build trust.

If you run into any issues, please feel free to open a ticket (or better yet, a PR), and we'll look into it.

## Credit

This project builds off the work of others. Credit where credit is due.

- [Ian Sanders (@iansan5653)](https://github.com/iansan5653) For creating his
  [Google App Script Template](https://github.com/iansan5653/gas-ts-template/generate) which this is based on.
- [Eric Anastas (@ericanastas)](https://github.com/ericanastas) For the
  [Google Apps Script Github Action](https://github.com/ericanastas/deploy-google-app-script-action)
