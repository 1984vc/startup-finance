![image](https://github.com/1984vc/StartupFinanceScripts/assets/2868/f1423f8a-d63c-43bb-b644-51378eb39d75)

# 1984 Startup Finance Scripts

This repository builds the finance Apps Script used by 1984's SAFE Conversion Worksheet

[SAFE Conversion Google Sheet](https://docs.google.com/spreadsheets/d/1eunUazlR9qeNVkH29ihF9MCrLtmBNAANByzck2HceX4/edit?usp=sharing)

## Why

While it's possible to do circular references to solve SAFE conversion inside of Google Sheets, it's easy to
mess up the calculations and it's not easy to test.

This library allows the user to customize the spreadsheet for their own purposes while allowing us to test the
library programatically.

## Credit

- [Ian Sanders (@iansan5653)](https://github.com/iansan5653) For creating his
  [Google App Script Template](https://github.com/iansan5653/gas-ts-template/generate) which this is based on.
- [Eric Anastas (@ericanastas)](https://github.com/ericanastas) For the
  [Google Apps Script Github Action](https://github.com/ericanastas/deploy-google-app-script-action)
