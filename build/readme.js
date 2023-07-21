import cpy from 'cpy';

cpy('./README.md', './dist/pioneer-code/pioneer-charts/')
  .then(() => {
    console.log("Pioneer Charts: README.md copied!");
  });


