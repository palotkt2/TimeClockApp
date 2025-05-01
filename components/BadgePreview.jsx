import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import DraggableQR from './DraggableQR';
import DraggableBarcode from './DraggableBarcode';
import ImageOptionsDrawer from './ImageOptionsDrawer';
import LogoOptionsDrawer from './LogoOptionsDrawer';
import TextOptionsDrawer from './TextOptionsDrawer';

const BadgePreview = ({
  viewingSide,
  setViewingSide,
  showBackside,
  frontBadgeRef,
  backBadgeRef,
  orientation,
  getBadgeBackground,
  getTextColorForTemplate,
  textColor,
  hasBorder,
  borderColor,
  fontFamily,
  logo,
  logoSize,
  template,
  company,
  photo,
  photoBorderStyle,
  photoBorderColor,
  nameSize,
  nameColor,
  name,
  titleSize,
  titleColor,
  title,
  idSize,
  idColor,
  idNumber,
  showQR,
  qrSide,
  qrValue,
  qrSize,
  qrDraggable,
  frontQrPosition,
  backQrPosition,
  onFrontQrPositionChange,
  onBackQrPositionChange,
  backText,
  downloadBadge,
  addToCart,
  isMobile,
  customFrontBadge,
  customBackBadge,
  onTextClick,
  showBarcode = true,
  barcodeValue = '123456789012',
  barcodeFormat = 'CODE128',
  barcodeSide = 'front',
  barcodeWidth = 2,
  barcodeHeight = 30,
  barcodeDraggable = false,
  frontBarcodePosition = { x: 50, y: 180 },
  backBarcodePosition = { x: 50, y: 180 },
  onFrontBarcodePositionChange,
  onBackBarcodePositionChange,
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const badgeContainerRef = useRef(null);
  const [isImageDrawerOpen, setIsImageDrawerOpen] = useState(false);
  const [isLogoDrawerOpen, setIsLogoDrawerOpen] = useState(false);
  const [isTextDrawerOpen, setIsTextDrawerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [templateKey, setTemplateKey] = useState(template || 'default');
  const [isPhotoPromptAnimating, setIsPhotoPromptAnimating] = useState(false);
  const [selectedTextField, setSelectedTextField] = useState(null);
  const [selectedTextValue, setSelectedTextValue] = useState('');
  const [selectedTextSize, setSelectedTextSize] = useState(16);
  const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');

  useEffect(() => {
    if (!badgeContainerRef.current) return;

    const loadImages = () => {
      const images = badgeContainerRef.current.querySelectorAll('img');

      if (images.length === 0) {
        setImagesLoaded(true);
        return;
      }

      let loadedCount = 0;
      const totalImages = images.length;

      const checkAllImagesLoaded = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.addEventListener('load', checkAllImagesLoaded);
          img.addEventListener('error', checkAllImagesLoaded);
        }
      });
    };

    loadImages();

    return () => {
      if (!badgeContainerRef.current) return;
      const images = badgeContainerRef.current.querySelectorAll('img');
      images.forEach((img) => {
        img.removeEventListener('load', () => {});
        img.removeEventListener('error', () => {});
      });
    };
  }, [customFrontBadge, customBackBadge, photo, logo, viewingSide]);

  useEffect(() => {
    // Update the key when template changes to force a complete re-render
    setTemplateKey((prevKey) => `${template || 'default'}-${Date.now()}`);
    setImagesLoaded(false);
  }, [template]);

  useEffect(() => {
    if (photo?.url) {
      setIsPhotoPromptAnimating(true);
      const timer = setTimeout(() => {
        setIsPhotoPromptAnimating(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [photo?.url]);

  const badgeWidth = orientation === 'portrait' ? 'w-64' : 'w-96';
  const badgeHeight = orientation === 'portrait' ? 'h-96' : 'h-64';

  const handleTextClick = (fieldType, textValue, fontSize, color) => {
    if (onTextClick) {
      // For direct actions (like the original code), process them immediately
      if (
        fieldType === 'updatePhoto' ||
        fieldType === 'updatePhotoBorderStyle' ||
        fieldType === 'updatePhotoBorderColor' ||
        fieldType === 'updatePhotoBorderVisibility' ||
        fieldType === 'updatePhotoSize' ||
        fieldType === 'removePhoto' ||
        fieldType === 'updateLogo' ||
        fieldType === 'uploadLogo' ||
        fieldType === 'updateLogoSize' ||
        fieldType === 'removeLogo'
      ) {
        onTextClick(fieldType, textValue);
        return;
      }

      // For text fields, open the drawer with appropriate values
      setSelectedTextField(fieldType);

      // Set up initial values based on field type
      switch (fieldType) {
        case 'name':
          setSelectedTextValue(name);
          setSelectedTextSize(nameSize);
          setSelectedTextColor(nameColor);
          break;
        case 'title':
          setSelectedTextValue(title);
          setSelectedTextSize(titleSize);
          setSelectedTextColor(titleColor);
          break;
        case 'id':
          setSelectedTextValue(idNumber);
          setSelectedTextSize(idSize);
          setSelectedTextColor(idColor);
          break;
        case 'company':
          setSelectedTextValue(company);
          setSelectedTextSize(16); // Default size
          setSelectedTextColor(textColor);
          break;
        case 'backText':
          setSelectedTextValue(backText);
          setSelectedTextSize(14); // Default size
          setSelectedTextColor(textColor);
          break;
        default:
          setSelectedTextValue(textValue || '');
          setSelectedTextSize(fontSize || 16);
          setSelectedTextColor(color || textColor);
      }

      setIsTextDrawerOpen(true);
    }
  };

  const handleTextUpdate = (newText) => {
    if (!onTextClick || !selectedTextField) return;

    onTextClick(
      `update${
        selectedTextField.charAt(0).toUpperCase() + selectedTextField.slice(1)
      }`,
      newText
    );
  };

  const handleFontSizeUpdate = (newSize) => {
    if (!onTextClick || !selectedTextField) return;

    switch (selectedTextField) {
      case 'name':
        onTextClick('updateNameSize', newSize);
        break;
      case 'title':
        onTextClick('updateTitleSize', newSize);
        break;
      case 'id':
        onTextClick('updateIdSize', newSize);
        break;
      // Add other cases as needed
    }
  };

  const handleFontColorUpdate = (newColor) => {
    if (!onTextClick || !selectedTextField) return;

    switch (selectedTextField) {
      case 'name':
        onTextClick('updateNameColor', newColor);
        break;
      case 'title':
        onTextClick('updateTitleColor', newColor);
        break;
      case 'id':
        onTextClick('updateIdColor', newColor);
        break;
      // Add other cases as needed
    }
  };

  const EditablePhoto = ({ src, alt, className, style }) => {
    return (
      <div
        className="relative cursor-pointer group"
        onClick={() => {
          setSelectedPhoto(src);
          setIsImageDrawerOpen(true);
        }}
      >
        <div
          className={`opacity-100 transition-opacity absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-600 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none ${
            isPhotoPromptAnimating ? 'animate-pulse' : ''
          }`}
        >
          Tap to edit photo
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-t-blue-600"></div>
        </div>

        <div
          className="hover:ring-2 hover:ring-blue-400 active:ring-blue-500 transition-all"
          style={{
            borderRadius:
              photoBorderStyle === 'rounded' ? '9999px' : '0.375rem',
          }}
        >
          <img
            src={src}
            alt={alt}
            className={`object-cover ${
              photo.borderVisible !== false ? 'border-2' : 'border-0'
            } ${
              photoBorderStyle === 'rounded' ? 'rounded-full' : 'rounded-md'
            }`}
            style={{
              width: photo.size,
              height: photo.size,
              ...(photo.borderVisible !== false
                ? { borderColor: photoBorderColor }
                : {}),
            }}
          />
        </div>
      </div>
    );
  };

  const EditableLogo = ({ src, alt, style }) => {
    return (
      <div
        className="relative cursor-pointer group"
        onClick={() => {
          setSelectedLogo(src);
          setIsLogoDrawerOpen(true);
        }}
      >
        <div className="opacity-100 transition-opacity absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-600 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
          Tap to edit logo
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-t-blue-600"></div>
        </div>

        <div className="hover:ring-2 hover:ring-blue-400 active:ring-blue-500 transition-all">
          <img src={src} alt={alt} className="object-contain" style={style} />
        </div>
      </div>
    );
  };

  const EditableText = ({
    children,
    fieldType,
    value,
    className,
    style,
    fontSize,
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative cursor-pointer group"
        onClick={() =>
          handleTextClick(fieldType, value, fontSize, style?.color)
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className="opacity-100 transition-opacity absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-600 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none">
            Tap to edit {fieldType}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-t-blue-600"></div>
          </div>
        )}
        <div className="hover:ring-1 hover:ring-blue-400 active:ring-blue-500 transition-all hover:bg-blue-50/30 px-1 py-0.5 rounded">
          <div style={style} className={className}>
            {children || value}
          </div>
        </div>
      </div>
    );
  };

  const renderBadgeContent = (side) => {
    if (side === 'front' && customFrontBadge) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={customFrontBadge}
            alt="Custom Front Badge Design"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (side === 'back' && customBackBadge) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={customBackBadge}
            alt="Custom Back Badge Design"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (side === 'front') {
      return (
        <>
          <div
            className="w-full flex justify-center mb-0 transition-all duration-200"
            style={{
              minHeight: '80px',
              height: 'auto',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {logo &&
              (onTextClick ? (
                <EditableLogo
                  src={logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: '100%',
                    height: logoSize + 'px',
                    maxHeight: '80px',
                    objectPosition: 'center',
                    transition: 'height 0.2s ease',
                  }}
                />
              ) : (
                <img
                  src={logo}
                  alt="Company Logo"
                  className="object-contain transition-all duration-200"
                  style={{
                    maxWidth: '100%',
                    height: logoSize + 'px',
                    maxHeight: '80px',
                    objectPosition: 'center',
                    transition: 'height 0.2s ease',
                  }}
                />
              ))}
          </div>

          <div className="flex justify-center mb-1">
            {photo && photo.url && (
              <div className="mb-3">
                {onTextClick ? (
                  <EditablePhoto
                    src={photo.url}
                    alt="Badge Photo"
                    className={`object-cover ${
                      photo.borderVisible !== false ? 'border-2' : 'border-0'
                    } ${
                      photoBorderStyle === 'rounded'
                        ? 'rounded-full'
                        : 'rounded-md'
                    }`}
                    style={{
                      width: photo.size,
                      height: photo.size,
                      ...(photo.borderVisible !== false
                        ? { borderColor: photoBorderColor }
                        : {}),
                    }}
                  />
                ) : (
                  <img
                    src={photo.url}
                    alt="Badge Photo"
                    className={`object-cover ${
                      photo.borderVisible ? 'border-2' : 'border-0'
                    } ${
                      photoBorderStyle === 'rounded'
                        ? 'rounded-full'
                        : 'rounded-md'
                    }`}
                    style={{
                      width: photo.size,
                      height: photo.size,
                      ...(photo.borderVisible
                        ? { borderColor: photoBorderColor }
                        : {}),
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            {onTextClick ? (
              <EditableText
                fieldType="name"
                value={name}
                className="font-bold"
                style={{
                  fontFamily,
                  fontSize: `${nameSize}px`,
                  color: nameColor,
                }}
              >
                {name}
              </EditableText>
            ) : (
              <h2
                style={{
                  fontFamily,
                  fontSize: `${nameSize}px`,
                  color: nameColor,
                }}
                className="font-bold"
              >
                {name}
              </h2>
            )}

            {onTextClick ? (
              <EditableText
                fieldType="title"
                value={title}
                style={{
                  fontFamily,
                  fontSize: `${titleSize}px`,
                  color: titleColor,
                }}
              >
                {title}
              </EditableText>
            ) : (
              <p
                style={{
                  fontFamily,
                  fontSize: `${titleSize}px`,
                  color: titleColor,
                }}
              >
                {title}
              </p>
            )}

            {onTextClick ? (
              <EditableText
                fieldType="id"
                value={idNumber}
                className="mt-2"
                style={{
                  fontFamily,
                  fontSize: `${idSize}px`,
                  color: idColor,
                }}
              >
                {idNumber}
              </EditableText>
            ) : (
              <p
                style={{
                  fontFamily,
                  fontSize: `${idSize}px`,
                  color: idColor,
                }}
                className="mt-2"
              >
                {idNumber}
              </p>
            )}

            {onTextClick ? (
              <EditableText
                fieldType="company"
                value={company}
                className="text-sm mt-1"
                style={{ fontFamily }}
              >
                {company}
              </EditableText>
            ) : (
              <p className="text-sm mt-1">{company}</p>
            )}
          </div>

          {showQR &&
            (qrSide === 'front' || qrSide === 'both') &&
            (qrDraggable ? (
              <DraggableQR
                value={qrValue}
                size={qrSize}
                initialPosition={frontQrPosition}
                onPositionChange={onFrontQrPositionChange}
              />
            ) : (
              <div
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <QRCode
                  value={qrValue || 'https://example.com'}
                  size={qrSize}
                  level="M"
                />
              </div>
            ))}

          {showBarcode &&
            (barcodeSide === 'front' || barcodeSide === 'both') &&
            (barcodeDraggable ? (
              <DraggableBarcode
                value={barcodeValue}
                format={barcodeFormat}
                width={barcodeWidth}
                height={barcodeHeight}
                initialPosition={frontBarcodePosition}
                onPositionChange={onFrontBarcodePositionChange}
              />
            ) : (
              <div
                className="absolute"
                style={{
                  top: '80%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Barcode
                  value={barcodeValue || '123456789012'}
                  format={barcodeFormat}
                  width={barcodeWidth}
                  height={barcodeHeight}
                  displayValue={true}
                  fontSize={10}
                  margin={5}
                />
              </div>
            ))}
        </>
      );
    } else if (side === 'back') {
      return (
        <>
          <div className="p-1">
            {onTextClick ? (
              <EditableText
                fieldType="backText"
                value={backText}
                className="whitespace-pre-wrap"
                style={{ fontFamily }}
              >
                {backText}
              </EditableText>
            ) : (
              <div className="whitespace-pre-wrap">{backText}</div>
            )}
          </div>

          {showQR &&
            (qrSide === 'back' || qrSide === 'both') &&
            (qrDraggable ? (
              <DraggableQR
                value={qrValue}
                size={qrSize}
                initialPosition={backQrPosition}
                onPositionChange={onBackQrPositionChange}
              />
            ) : (
              <div
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <QRCode
                  value={qrValue || 'https://example.com'}
                  size={qrSize}
                  level="M"
                />
              </div>
            ))}

          {showBarcode &&
            (barcodeSide === 'back' || barcodeSide === 'both') &&
            (barcodeDraggable ? (
              <DraggableBarcode
                value={barcodeValue}
                format={barcodeFormat}
                width={barcodeWidth}
                height={barcodeHeight}
                initialPosition={backBarcodePosition}
                onPositionChange={onBackBarcodePositionChange}
              />
            ) : (
              <div
                className="absolute"
                style={{
                  top: '80%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Barcode
                  value={barcodeValue || '123456789012'}
                  format={barcodeFormat}
                  width={barcodeWidth}
                  height={barcodeHeight}
                  displayValue={true}
                  fontSize={10}
                  margin={5}
                />
              </div>
            ))}
        </>
      );
    }

    return null;
  };

  const handleImageOptionSelect = (optionId) => {
    if (!onTextClick) return;

    switch (optionId) {
      case 'upload':
        onTextClick('uploadPhoto');
        break;
      case 'sample':
        onTextClick('images', 'samples');
        break;
      case 'border':
        onTextClick('shape', 'photoBorder');
        break;
      case 'remove':
        onTextClick('removePhoto');
        break;
      default:
        onTextClick('images');
    }

    setIsImageDrawerOpen(false);
  };

  const handleLogoOptionSelect = (optionId) => {
    if (!onTextClick) return;

    switch (optionId) {
      case 'upload':
        onTextClick('uploadLogo');
        break;
      case 'sample':
        onTextClick('logos', 'samples');
        break;
      case 'remove':
        onTextClick('removeLogo');
        break;
      default:
        onTextClick('logos');
    }

    setIsLogoDrawerOpen(false);
  };

  const getBadgeStyle = () => {
    const background =
      (viewingSide === 'front' && customFrontBadge) ||
      (viewingSide === 'back' && customBackBadge)
        ? 'transparent'
        : getBadgeBackground();

    // Debug log
    console.log(`BadgePreview: template=${template}, background=${background}`);

    // Check if it's an image background (URL, data URI, or CSS url())
    const isImageBackground =
      typeof background === 'string' &&
      (background.startsWith('url(') ||
        background.startsWith('http') ||
        background.startsWith('data:image') ||
        background.startsWith('blob:'));

    if (isImageBackground) {
      // If it's already in url() format, use it directly
      const backgroundUrl = background.startsWith('url(')
        ? background
        : `url(${background})`;

      return {
        backgroundImage: backgroundUrl,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: getTextColorForTemplate(textColor),
        border: hasBorder ? `2px solid ${borderColor}` : 'none',
      };
    }

    // If it's a color or gradient
    return {
      background: background,
      color: getTextColorForTemplate(textColor),
      border: hasBorder ? `2px solid ${borderColor}` : 'none',
    };
  };

  if (isMobile) {
    return (
      <>
        <ImageOptionsDrawer
          isOpen={isImageDrawerOpen}
          onClose={() => setIsImageDrawerOpen(false)}
          onPhotoUpload={(url) => {
            if (onTextClick) onTextClick('updatePhoto', url);
            setIsImageDrawerOpen(false);
          }}
          onOptionSelect={handleImageOptionSelect}
          onRemovePhoto={() => {
            if (onTextClick) onTextClick('updatePhoto', null);
            setIsImageDrawerOpen(false);
          }}
          photo={photo}
          photoBorderStyle={photoBorderStyle}
          photoBorderColor={photoBorderColor}
          setPhotoBorderStyle={(style) =>
            onTextClick && onTextClick('updatePhotoBorderStyle', style)
          }
          setPhotoBorderColor={(color) =>
            onTextClick && onTextClick('updatePhotoBorderColor', color)
          }
          borderVisible={photo?.borderVisible}
          setBorderVisible={(visible) =>
            onTextClick && onTextClick('updatePhotoBorderVisibility', visible)
          }
          photoSize={photo?.size || 125}
          setPhotoSize={(size) =>
            onTextClick && onTextClick('updatePhotoSize', size)
          }
        />

        <LogoOptionsDrawer
          isOpen={isLogoDrawerOpen}
          onClose={() => setIsLogoDrawerOpen(false)}
          onLogoUpload={(url) => {
            if (onTextClick) onTextClick('updateLogo', url);
            setIsLogoDrawerOpen(false);
          }}
          onOptionSelect={handleLogoOptionSelect}
          onRemoveLogo={() => {
            if (onTextClick) onTextClick('updateLogo', null);
            setIsLogoDrawerOpen(false);
          }}
          logo={logo}
          logoSize={logoSize || 50}
          setLogoSize={(size) =>
            onTextClick && onTextClick('updateLogoSize', size)
          }
        />

        <TextOptionsDrawer
          isOpen={isTextDrawerOpen}
          onClose={() => setIsTextDrawerOpen(false)}
          fieldType={selectedTextField}
          text={selectedTextValue}
          updateText={handleTextUpdate}
          fontFamily={fontFamily}
          updateFontFamily={(newFont) =>
            onTextClick && onTextClick('updateFontFamily', newFont)
          }
          fontSize={selectedTextSize}
          updateFontSize={handleFontSizeUpdate}
          fontColor={selectedTextColor}
          updateFontColor={handleFontColorUpdate}
          fontOptions={[
            { value: 'Arial', label: 'Arial' },
            { value: 'Helvetica', label: 'Helvetica' },
            { value: 'Verdana', label: 'Verdana' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Courier New', label: 'Courier New' },
            { value: 'Tahoma', label: 'Tahoma' },
            { value: 'Trebuchet MS', label: 'Trebuchet MS' },
            { value: 'Impact', label: 'Impact' },
          ]}
        />

        <div className="lg:hidden block mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center mb-4">
            <h3 className="font-medium text-gray-700">Badge Preview</h3>
            <p className="text-sm text-gray-500">
              {viewingSide === 'front' ? 'Front Side' : 'Back Side'}
            </p>
          </div>

          <div
            ref={badgeContainerRef}
            key={templateKey}
            className={`mx-auto ${badgeWidth} ${badgeHeight} relative overflow-hidden rounded-lg`}
            style={getBadgeStyle()}
          >
            {renderBadgeContent(viewingSide)}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => downloadBadge(viewingSide)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              id={`download-${viewingSide}-btn`}
            >
              Download {viewingSide === 'front' ? 'Front' : 'Back'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="col-span-1 hidden lg:block">
      <ImageOptionsDrawer
        isOpen={isImageDrawerOpen}
        onClose={() => setIsImageDrawerOpen(false)}
        onPhotoUpload={(url) => {
          if (onTextClick) onTextClick('updatePhoto', url);
          setIsImageDrawerOpen(false);
        }}
        onOptionSelect={handleImageOptionSelect}
        onRemovePhoto={() => {
          if (onTextClick) onTextClick('updatePhoto', null);
          setIsImageDrawerOpen(false);
        }}
        photo={photo}
        photoBorderStyle={photoBorderStyle}
        photoBorderColor={photoBorderColor}
        setPhotoBorderStyle={(style) =>
          onTextClick && onTextClick('updatePhotoBorderStyle', style)
        }
        setPhotoBorderColor={(color) =>
          onTextClick && onTextClick('updatePhotoBorderColor', color)
        }
        borderVisible={photo?.borderVisible}
        setBorderVisible={(visible) =>
          onTextClick && onTextClick('updatePhotoBorderVisibility', visible)
        }
        photoSize={photo?.size || 125}
        setPhotoSize={(size) =>
          onTextClick && onTextClick('updatePhotoSize', size)
        }
      />

      <LogoOptionsDrawer
        isOpen={isLogoDrawerOpen}
        onClose={() => setIsLogoDrawerOpen(false)}
        onLogoUpload={(url) => {
          if (onTextClick) onTextClick('updateLogo', url);
          setIsLogoDrawerOpen(false);
        }}
        onOptionSelect={handleLogoOptionSelect}
        onRemoveLogo={() => {
          if (onTextClick) onTextClick('updateLogo', null);
          setIsLogoDrawerOpen(false);
        }}
        logo={logo}
        logoSize={logoSize || 50}
        setLogoSize={(size) =>
          onTextClick && onTextClick('updateLogoSize', size)
        }
      />

      <TextOptionsDrawer
        isOpen={isTextDrawerOpen}
        onClose={() => setIsTextDrawerOpen(false)}
        fieldType={selectedTextField}
        text={selectedTextValue}
        updateText={handleTextUpdate}
        fontFamily={fontFamily}
        updateFontFamily={(newFont) =>
          onTextClick && onTextClick('updateFontFamily', newFont)
        }
        fontSize={selectedTextSize}
        updateFontSize={handleFontSizeUpdate}
        fontColor={selectedTextColor}
        updateFontColor={handleFontColorUpdate}
        fontOptions={[
          { value: 'Arial', label: 'Arial' },
          { value: 'Helvetica', label: 'Helvetica' },
          { value: 'Verdana', label: 'Verdana' },
          { value: 'Times New Roman', label: 'Times New Roman' },
          { value: 'Georgia', label: 'Georgia' },
          { value: 'Courier New', label: 'Courier New' },
          { value: 'Tahoma', label: 'Tahoma' },
          { value: 'Trebuchet MS', label: 'Trebuchet MS' },
          { value: 'Impact', label: 'Impact' },
        ]}
      />

      <div className="sticky top-32 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {showBackside && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setViewingSide('front')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  viewingSide === 'front'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setViewingSide('back')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  viewingSide === 'back'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Back Side
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div
            ref={viewingSide === 'front' ? frontBadgeRef : backBadgeRef}
            id="badge-preview-container"
            key={templateKey}
            className={`relative ${badgeWidth} ${badgeHeight} rounded-lg overflow-hidden shadow-lg`}
            style={getBadgeStyle()}
          >
            <div
              ref={badgeContainerRef}
              className="w-full h-full p-4 flex flex-col"
            >
              {renderBadgeContent(viewingSide)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={() => downloadBadge(viewingSide)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
            id={`download-${viewingSide}-btn`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download {viewingSide === 'front' ? 'Front' : 'Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgePreview;
