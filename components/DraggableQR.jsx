import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const DraggableQR = ({
  value,
  size = 128,
  initialPosition = { x: 10, y: 10 },
  onPositionChange,
}) => {
  const qrRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const parentRef = useRef(null);

  useEffect(() => {
    // Update position if initialPosition changes
    setPosition(initialPosition);
  }, [initialPosition]);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    if (!qrRef.current) return;

    const rect = qrRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Handle mouse move event while dragging
  const handleMouseMove = (e) => {
    if (!isDragging || !qrRef.current || !parentRef.current) return;

    const parentRect = parentRef.current.getBoundingClientRect();
    const qrRect = qrRef.current.getBoundingClientRect();

    // Calculate new position within parent boundaries
    let newX = e.clientX - parentRect.left - dragOffset.x;
    let newY = e.clientY - parentRect.top - dragOffset.y;

    // Apply boundaries
    newX = Math.max(0, Math.min(newX, parentRect.width - qrRect.width));
    newY = Math.max(0, Math.min(newY, parentRect.height - qrRect.height));

    setPosition({ x: newX, y: newY });

    // Notify parent component of position change if callback exists
    if (onPositionChange) {
      onPositionChange({ x: newX, y: newY });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced touch events for mobile
  const handleTouchStart = (e) => {
    if (!qrRef.current) return;

    // Prevent default to avoid scrolling
    e.preventDefault();

    const rect = qrRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !qrRef.current || !parentRef.current) return;

    // Prevent default to avoid scrolling while dragging
    e.preventDefault();

    const parentRect = parentRef.current.getBoundingClientRect();
    const qrRect = qrRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    // Calculate new position within parent boundaries
    let newX = touch.clientX - parentRect.left - dragOffset.x;
    let newY = touch.clientY - parentRect.top - dragOffset.y;

    // Apply boundaries with a small padding
    const padding = 2;
    newX = Math.max(
      padding,
      Math.min(newX, parentRect.width - qrRect.width - padding)
    );
    newY = Math.max(
      padding,
      Math.min(newY, parentRect.height - qrRect.height - padding)
    );

    setPosition({ x: newX, y: newY });

    // Notify parent component of position change if callback exists
    if (onPositionChange) {
      onPositionChange({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Add global event listeners
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleTouchEnd);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div
      ref={parentRef}
      className="absolute inset-0"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        ref={qrRef}
        className={`absolute cursor-move ${
          isDragging ? 'opacity-70 scale-105' : 'opacity-100'
        }`}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          touchAction: 'none',
          transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s',
          transform: `scale(${isDragging ? 1.05 : 1})`,
          boxShadow: isDragging ? '0 0 10px rgba(0, 0, 0, 0.2)' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <QRCode value={value || 'https://example.com'} size={size} level="M" />
      </div>
    </div>
  );
};

export default DraggableQR;
