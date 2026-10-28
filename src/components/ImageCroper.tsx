
"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { cropImage } from "@/lib/cropImage";
import Button from "./Button";

type Props = {
    image: string;
    onCancel: () => void;
    onCrop: (blob: Blob) => void;
};

export default function ImageCropper({
    image,
    onCancel,
    onCrop,
}: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropArea, setCropArea] = useState<Area | null>(null);
    const [saving, setSaving] = useState(false);

    const handleCropComplete = useCallback(
        (_: Area, pixels: Area) => {
            setCropArea(pixels);
        },
        [],
    );

    const handleConfirm = async () => {
        if (!cropArea || saving) return;

        setSaving(true);

        try {
            const blob = await cropImage(image, cropArea);
            onCrop(blob);
        } catch (error) {
            console.error(error);
            setSaving(false);
        }
    };

    useEffect(() => {
        const scrollY = window.scrollY;

        const previousStyles = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
            overflow: document.body.style.overflow,
        };

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
            Object.assign(document.body.style, previousStyles);
            window.scrollTo(0, scrollY);
        };
    }, []);

    return (
        <div
            className="
                fixed inset-0 z-60
                flex items-center justify-center
                overflow-y-auto
                bg-black/70
                p-4
                mt-0!
                [&_div]:mt-0!
            "
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="crop-title"
                className="
                    flex
                    flex-col
                    gap-3
                    w-full 
                    max-w-xl 
                    p-5 
                    shadow-xl
                    pillow
                    squircle-large
                "
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="crop-title"
                    className="text-xl font-semibold"
                >
                    Crop Project Image
                </h2>

                <div className="
                    relative h-[min(60vh,400px)]
                    overflow-hidden rounded-xl bg-black
                ">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={3 / 2}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        Zoom
                    </label>

                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) =>
                            setZoom(Number(e.target.value))
                        }
                        className="w-full cursor-pointer focus:shadow-none! mb-0!"
                    />                    
                </div>



                <div className="flex justify-between gap-6">
                    <Button
                        type="button"
                        variant="red"
                        onClick={onCancel}
                        disabled={saving}
                        className="disabled:opacity-50"
                        x={4}
                        y={2}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!cropArea || saving}
                        className="disabled:opacity-50"
                        x={4}
                        y={2}
                    >
                        {saving ? "Cropping..." : "Use image"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
