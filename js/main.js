// Border style selection handler
document.querySelectorAll('.border-style-option').forEach((option) => {
  option.addEventListener('click', function () {
    // Update active state on options
    document.querySelectorAll('.border-style-option').forEach((opt) => {
      opt.classList.remove('active');
    });
    this.classList.add('active');

    // Apply the selected style to images
    const borderStyle = this.getAttribute('data-style');
    const badgeImages = document.querySelectorAll('.badge-image'); // Update selector based on your actual image class

    badgeImages.forEach((image) => {
      image.classList.remove('image-rounded', 'image-square');
      image.classList.add(`image-${borderStyle}`);
    });
  });
});
