const rootStyles = window.getComputedStyle(document.documentElement);

const ready = () => {
  const coverWidth = parseFloat(
    rootStyles.getPropertyValue('--book-cover-width-lg')
  );
  const coverAspectRatio = parseFloat(
    rootStyles.getPropertyValue('--book-cover-aspect-ratio')
  );

  const coverHeight = coverWidth / coverAspectRatio;

  // Register the plugins
  FilePond.registerPlugin(
    FilePondPluginFileEncode,
    FilePondPluginImagePreview,
    FilePondPluginImageResize
  );

  // ... FilePond initialization code here
  FilePond.setOptions({
    stylePanelAspectRatio: 1 / coverAspectRatio,
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverHeight,
  });

  FilePond.parse(document.body);
};

if (
  rootStyles.getPropertyValue('--book-cover-width-lg') != null &&
  rootStyles.getPropertyValue('--book-cover-width-lg') !== ''
)
  ready();
else {
  document.getElementById('main-css').addEventListener('load', ready);
}
