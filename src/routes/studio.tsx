import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { PRODUCTS, CATEGORIES, type Category, type Product } from "@/lib/products";
import { getProducts } from "@/lib/products-store";
import { useAuth } from "@/lib/auth";
import { getDesigns, type ReferenceDesign } from "@/lib/designs-store";
import { placeOrder } from "@/lib/orders-store";
import { saveDesignToWishlist } from "@/lib/wishlist-store";
import teeFront from "@/assets/tee-front.png";
import teeBack from "@/assets/tee-back.png";
import { Upload, Type, Save, RotateCcw, Trash2, ShoppingBag, Share2, Heart } from "lucide-react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Design Studio — Custom On" },
      {
        name: "description",
        content:
          "Upload artwork, add text, change fonts and colors, and preview your custom T-shirt design live on the front and back.",
      },
      { property: "og:title", content: "Design Studio — Custom On" },
      {
        property: "og:description",
        content: "Custom T-shirt design canvas with live front and back preview.",
      },
    ],
  }),
  component: StudioPage,
});

const SHIRT_COLORS = [
  { name: "White", value: "#FFFFFF", text: "#0A0A0A" },
  { name: "Black", value: "#0A0A0A", text: "#FFFFFF" },
  { name: "Orange", value: "#FF5F1F", text: "#FFFFFF" },
  { name: "Cream", value: "#F5EFE0", text: "#0A0A0A" },
  { name: "Navy", value: "#1F2A44", text: "#FFFFFF" },
];

const FONTS = [
  { label: "Display", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Sans", value: "'Inter', sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
];

type View = "front" | "back";

const COLOR_NAMES: Record<string, string> = {
  "#0A0A0A": "Black",
  "#FFFFFF": "White",
  "#FF5F1F": "Orange",
  "#1F2A44": "Navy",
  "#F5EFE0": "Cream",
  "#9CA3AF": "Heather Gray",
  "#7F1D1D": "Burgundy"
};

const getContrastColor = (hex: string) => {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? "#FFFFFF" : "#0A0A0A";
};

const REFERENCE_DESIGNS = [
  {
    name: "Retro Surf Circle",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%230A0A0A" /><circle cx="50" cy="50" r="42" fill="none" stroke="%23FF5F1F" stroke-width="2" /><path d="M 25,50 A 25,25 0 0,1 75,50 Z" fill="%23FF5F1F" /><line x1="22" y1="54" x2="78" y2="54" stroke="%230A0A0A" stroke-width="2" /><line x1="25" y1="58" x2="75" y2="58" stroke="%230A0A0A" stroke-width="2" /><line x1="30" y1="62" x2="70" y2="62" stroke="%230A0A0A" stroke-width="2" /><path d="M 28,68 Q 39,64 50,68 T 72,68" fill="none" stroke="%23FF5F1F" stroke-width="2" /><path d="M 32,74 Q 41,70 50,74 T 68,74" fill="none" stroke="%23FF5F1F" stroke-width="2" /><text x="50" y="32" fill="%23FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="1">CALIFORNIA</text><text x="50" y="85" fill="%23FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" font-weight="bold" text-anchor="middle" letter-spacing="2">WEST COAST</text></svg>`
  },
  {
    name: "Wilderness Peak",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="50,28 72,68 28,68" fill="none" stroke="%230A0A0A" stroke-width="2" /><polygon points="62,42 78,68 46,68" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><circle cx="38" cy="38" r="6" fill="%23FF5F1F" /><line x1="33" y1="68" x2="33" y2="58" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="30,59 36,59 33,53" fill="%230A0A0A" /><line x1="67" y1="68" x2="67" y2="60" stroke="%230A0A0A" stroke-width="1.5" /><polygon points="65,61 69,61 67,56" fill="%230A0A0A" /><line x1="20" y1="68" x2="80" y2="68" stroke="%230A0A0A" stroke-width="2" /><text x="50" y="80" fill="%230A0A0A" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="2">WILDERNESS</text></svg>`
  },
  {
    name: "Retro Creative",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50"><rect width="150" height="50" rx="8" fill="%230A0A0A" /><line x1="10" y1="12" x2="140" y2="12" stroke="%23FF5F1F" stroke-width="1" stroke-opacity="0.3" /><line x1="10" y1="38" x2="140" y2="38" stroke="%23FF5F1F" stroke-width="1" stroke-opacity="0.3" /><text x="75" y="31" fill="%23FF5F1F" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="4">CREATIVE</text><text x="75" y="44" fill="%23FFFFFF" font-family="monospace" font-size="5" font-weight="bold" text-anchor="middle" letter-spacing="3">DESIGN STUDIO v1.0</text></svg>`
  },
  {
    name: "Cyber Grid",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A0A0A" rx="10" /><line x1="10" y1="50" x2="90" y2="50" stroke="%231F2A44" stroke-width="0.5" /><line x1="50" y1="10" x2="50" y2="90" stroke="%231F2A44" stroke-width="0.5" /><ellipse cx="50" cy="50" rx="30" ry="30" fill="none" stroke="%23FF5F1F" stroke-width="1.5" /><ellipse cx="50" cy="50" rx="15" ry="30" fill="none" stroke="%23FF5F1F" stroke-width="1" /><ellipse cx="50" cy="50" rx="5" ry="30" fill="none" stroke="%23FF5F1F" stroke-width="0.5" /><ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="%23FF5F1F" stroke-width="1" /><ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="%23FF5F1F" stroke-width="1" /><line x1="15" y1="15" x2="25" y2="15" stroke="%23FFFFFF" stroke-width="1" /><line x1="15" y1="15" x2="15" y2="25" stroke="%23FFFFFF" stroke-width="1" /><line x1="85" y1="85" x2="75" y2="85" stroke="%23FFFFFF" stroke-width="1" /><line x1="85" y1="85" x2="85" y2="75" stroke="%23FFFFFF" stroke-width="1" /><text x="50" y="92" fill="%23FFFFFF" font-family="monospace" font-size="5" text-anchor="middle" letter-spacing="1">SYSTEM OVERRIDE</text></svg>`
  },
  {
    name: "Vintage Bloom",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="8" fill="%23FF5F1F" /><path d="M 50,42 C 45,30 55,30 50,42 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 50,58 C 45,70 55,70 50,58 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 42,50 C 30,45 30,55 42,50 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 58,50 C 70,45 70,55 58,50 Z" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 44,44 C 34,34 40,30 44,44 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 56,56 C 66,66 60,70 56,56 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 56,44 C 66,34 70,40 56,44 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 44,56 C 34,66 30,60 44,56 Z" fill="none" stroke="%230A0A0A" stroke-width="1" /><path d="M 50,50 L 50,85" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 50,65 Q 40,60 42,55" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><path d="M 50,72 Q 60,67 58,62" fill="none" stroke="%230A0A0A" stroke-width="1.5" /><text x="50" y="93" fill="%230A0A0A" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="2">BLOOM</text></svg>`
  }
];

function StudioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<View>("front");
  
  // Redirect shop owners away from the customer Design Studio
  useEffect(() => {
    if (user?.role === "shop-owner") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);
  
  // Dynamic garment selection from catalog with category tabs
  const [studioProducts, setStudioProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<Category>("T-Shirts");
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [shirt, setShirt] = useState(SHIRT_COLORS[0]);

  // Load custom catalog blanks and filter on category change
  useEffect(() => {
    const prods = getProducts();
    setStudioProducts(prods);
    const firstInCat = prods.find((p) => p.category === selectedCategory);
    if (firstInCat) {
      setSelectedProduct(firstInCat);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const defaultColor = selectedProduct.colors[0];
    setShirt({
      name: COLOR_NAMES[defaultColor] || "Custom Color",
      value: defaultColor,
      text: getContrastColor(defaultColor)
    });
  }, [selectedProduct]);

  // Load reference designs dynamically
  const [designs, setDesigns] = useState<ReferenceDesign[]>([]);
  useEffect(() => {
    setDesigns(getDesigns());
  }, []);

  const [text, setText] = useState("YOUR TEXT");
  const [font, setFont] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#0A0A0A");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(180);
  const fileRef = useRef<HTMLInputElement>(null);

  // Order modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Real-Time Price Calculation
  const basePrice = selectedProduct.price;
  const hasCustomText = text.trim() && text !== "YOUR TEXT" && text !== "";
  const hasCustomGraphic = !!imageUrl;
  const textFee = hasCustomText ? 2.0 : 0.0;
  const graphicFee = hasCustomGraphic ? 3.5 : 0.0;
  const totalPrice = basePrice + textFee + graphicFee;

  // Load shared design states or pending design on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if there is a pending design saved before login redirection
    const pendingData = localStorage.getItem("customon:pending-design");
    if (pendingData) {
      try {
        const design = JSON.parse(pendingData);
        if (design.productId) {
          const allProds = getProducts();
          const match = allProds.find((p) => p.id === design.productId);
          if (match) {
            setSelectedProduct(match);
            setSelectedCategory(match.category);
          }
        }
        if (design.shirtColor && design.shirtColorName) {
          setShirt({
            name: design.shirtColorName,
            value: design.shirtColor,
            text: getContrastColor(design.shirtColor),
          });
        }
        if (design.text !== undefined) setText(design.text);
        if (design.font) setFont(design.font);
        if (design.textColor) setTextColor(design.textColor);
        if (design.fontSize) setFontSize(Number(design.fontSize));
        if (design.imageUrl !== undefined) setImageUrl(design.imageUrl);
        if (design.imageSize !== undefined) setImageSize(Number(design.imageSize));

        // Clear the pending design so it doesn't reload next time
        localStorage.removeItem("customon:pending-design");
        return;
      } catch (e) {
        console.error("Failed to restore pending design", e);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const prodId = params.get("productId");
    const colorVal = params.get("color");
    const colorNm = params.get("colorName");
    const txtVal = params.get("text");
    const fontVal = params.get("font");
    const txtCol = params.get("textColor");
    const txtSz = params.get("fontSize");
    const graphicNm = params.get("graphic");

    if (prodId) {
      const allProds = getProducts();
      const match = allProds.find((p) => p.id === prodId);
      if (match) {
        setSelectedProduct(match);
        setSelectedCategory(match.category);
      }
    }
    if (colorVal && colorNm) {
      setShirt({
        name: colorNm,
        value: colorVal,
        text: getContrastColor(colorVal),
      });
    }
    if (txtVal !== null) setText(txtVal);
    if (fontVal) setFont(fontVal);
    if (txtCol) setTextColor(txtCol);
    if (txtSz) setFontSize(Number(txtSz));

    if (graphicNm) {
      // Find within reference templates or owner uploads
      const allTemplates = [...REFERENCE_DESIGNS, ...getDesigns()];
      const matchG = allTemplates.find((d) => d.name === graphicNm);
      if (matchG) setImageUrl(matchG.svg);
    }
  }, [designs]);

  // Share Design Link
  const [shareSuccess, setShareSuccess] = useState(false);
  const handleShareDesign = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams({
      productId: selectedProduct.id,
      color: shirt.value,
      colorName: shirt.name,
      text: text,
      font: font,
      textColor: textColor,
      fontSize: fontSize.toString(),
    });
    const matchingTemplate = [...REFERENCE_DESIGNS, ...designs].find((d) => d.svg === imageUrl);
    if (matchingTemplate) {
      params.append("graphic", matchingTemplate.name);
    }
    const shareUrl = `${window.location.origin}/studio?${params.toString()}`;

    const triggerSuccess = () => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    };

    // Fallback copy utility for HTTP / non-localhost environments
    const fallbackCopy = (val: string) => {
      try {
        const textArea = document.createElement("textarea");
        val = val.trim();
        textArea.value = val;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          triggerSuccess();
        } else {
          // If all options fail, display a fallback alert box letting users manually copy
          window.prompt("Copy this design link to share:", val);
        }
      } catch (err) {
        console.error("Clipboard fallback failed", err);
        window.prompt("Copy this design link to share:", val);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => triggerSuccess())
        .catch((err) => {
          console.warn("navigator.clipboard failed, using fallback copy", err);
          fallbackCopy(shareUrl);
        });
    } else {
      fallbackCopy(shareUrl);
    }
  };

  // Save Design
  const [saveSuccess, setSaveSuccess] = useState(false);
  const handleSaveDesign = () => {
    if (!user) {
      alert("Please log in as a customer to save your design.");
      
      const payload = {
        productId: selectedProduct.id,
        shirtColor: shirt.value,
        shirtColorName: shirt.name,
        text,
        font,
        fontSize,
        textColor,
        imageUrl,
        imageSize,
      };
      
      try {
        localStorage.setItem("customon:pending-design", JSON.stringify(payload));
      } catch (e) {
        console.error("Failed to save pending design state", e);
      }

      navigate({ to: "/login" });
      return;
    }

    const designName = prompt("Enter a name for your design:", `My Custom ${selectedProduct.name}`);
    if (designName === null) return; // user cancelled prompt
    
    const finalName = designName.trim() || `My Custom ${selectedProduct.name}`;

    saveDesignToWishlist({
      productId: selectedProduct.id,
      productName: finalName,
      shirtColor: shirt.value,
      shirtColorName: shirt.name,
      customText: text,
      customTextColor: textColor,
      customTextFont: font,
      customTextSize: fontSize,
      customImage: imageUrl,
      price: totalPrice,
    }, user.username);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);

      // Automatically generate and download a separate PDF containing only the high-resolution photo
      try {
        const { jsPDF } = await import("jspdf");
        const img = new Image();
        img.onload = () => {
          const doc = new jsPDF({
            orientation: img.width > img.height ? "landscape" : "portrait",
            unit: "mm",
            format: "a4"
          });
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          const margin = 10;
          const maxWidth = pageWidth - margin * 2;
          const maxHeight = pageHeight - margin * 2;
          
          let imgWidth = img.width;
          let imgHeight = img.height;
          const ratio = imgWidth / imgHeight;
          
          if (imgWidth > maxWidth) {
            imgWidth = maxWidth;
            imgHeight = imgWidth / ratio;
          }
          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = imgHeight * ratio;
          }
          
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          doc.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
          doc.save(`uploaded-graphic-${Date.now()}.pdf`);
        };
        img.src = dataUrl;
      } catch (err) {
        console.error("Failed to generate uploaded photo PDF", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setText("YOUR TEXT");
    setFont(FONTS[0].value);
    setFontSize(40);
    setTextColor("#0A0A0A");
    setImageUrl(null);
    setImageSize(180);
  };

  const downloadAsPng = (dataUrl: string, fileName: string) => {
    if (!dataUrl) return;
    
    // If it's already a PNG data URL, we can download it directly
    if (dataUrl.startsWith("data:image/png")) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.click();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = fileName;
          link.click();
        } catch (e) {
          console.error("Canvas export failed", e);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = fileName;
          link.click();
        }
      }
    };
    img.src = dataUrl;
  };

  const generateOrderPdf = async (orderId: string, orderDetails: any) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Title header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(10, 10, 10);
      doc.text("CUSTOM ON - CUSTOM APPAREL ORDER", 15, 20);

      // Divider line
      doc.setDrawColor(255, 95, 31); // Brand Orange
      doc.setLineWidth(1);
      doc.line(15, 25, 195, 25);

      // Order Summary section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      doc.text("Order Specifications", 15, 35);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const summaryItems = [
        ["Order ID:", `#${orderId}`],
        ["Date:", new Date().toLocaleDateString()],
        ["Customer Name:", orderDetails.customerName],
        ["Product Blank:", orderDetails.productName],
        ["Garment Color:", orderDetails.shirtColorName],
        ["Custom Text:", orderDetails.customText !== "YOUR TEXT" && orderDetails.customText ? orderDetails.customText : "None"],
        ["Total Price:", `$${orderDetails.totalPrice.toFixed(2)}`]
      ];

      let currentY = 43;
      summaryItems.forEach(([label, val]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 15, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(val, 55, currentY);
        currentY += 7;
      });

      // Shipping details section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Shipping Information", 15, 100);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      doc.setFont("helvetica", "bold");
      doc.text("Receiver Name:", 15, 108);
      doc.setFont("helvetica", "normal");
      doc.text(orderDetails.shippingName, 55, 108);

      doc.setFont("helvetica", "bold");
      doc.text("Contact Phone:", 15, 115);
      doc.setFont("helvetica", "normal");
      doc.text(orderDetails.shippingPhone, 55, 115);

      doc.setFont("helvetica", "bold");
      doc.text("Address details:", 15, 122);
      doc.setFont("helvetica", "normal");
      
      // Split shipping address text to wrap nicely
      const splitAddress = doc.splitTextToSize(orderDetails.shippingAddress, 130);
      doc.text(splitAddress, 55, 122);

      // Check if custom image exists to append it
      if (orderDetails.customImage) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Custom Graphic Design", 15, 150);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Below is the custom graphic image applied to this apparel design:", 15, 157);

        const getPngDataUrl = async (url: string): Promise<string> => {
          if (url.startsWith("data:image/png;base64,")) {
            return url;
          }
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || 800;
              canvas.height = img.naturalHeight || 800;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                try {
                  resolve(canvas.toDataURL("image/png"));
                } catch (e) {
                  reject(e);
                }
              } else {
                reject(new Error("Context failed"));
              }
            };
            img.onerror = () => reject(new Error("Image failed"));
            img.src = url;
          });
        };

        try {
          const pngDataUrl = await getPngDataUrl(orderDetails.customImage);
          // Insert image centered on page, scaled appropriately
          doc.addImage(pngDataUrl, "PNG", 15, 162, 90, 90);
        } catch (e) {
          console.error("Failed to render custom image inside PDF", e);
          doc.text("Error rendering custom design graphic.", 15, 165);
        }
      }

      doc.save(`custom-order-${orderId}.pdf`);
      return true;
    } catch (err) {
      console.error("PDF generation failed", err);
      return false;
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in as a customer to place an order.");
      navigate({ to: "/login" });
      return;
    }

    const orderData = {
      customerName: user.username,
      shippingName: shippingName.trim(),
      shippingAddress: shippingAddress.trim(),
      shippingPhone: shippingPhone.trim(),
      productName: selectedProduct.name,
      shirtColor: shirt.value,
      shirtColorName: shirt.name,
      customText: text,
      customTextColor: textColor,
      customTextFont: font,
      customTextSize: fontSize,
      customImage: imageUrl,
      totalPrice: totalPrice,
    };

    const order = placeOrder(orderData);

    let message = `Hello! I just confirmed a custom order on Custom On.

Order ID: #${order.id}
Product: ${selectedProduct.name}
Color: ${shirt.name}
Text: ${text !== "YOUR TEXT" ? text : "None"}
Estimated Price: $${totalPrice.toFixed(2)}`;

    // If customized using an image, generate a PDF and alert the user
    if (imageUrl) {
      alert("Custom graphic detected! Generating and downloading a PDF document of your design. Please send this PDF to the owner in the WhatsApp chat next.");
      await generateOrderPdf(order.id, orderData);
      message += `\n\nI have generated a PDF of my custom photo/design order. I am sending the PDF in this chat.`;
    } else {
      // Otherwise, construct design link mockup
      const params = new URLSearchParams({
        productId: selectedProduct.id,
        color: shirt.value,
        colorName: shirt.name,
        text: text,
        font: font,
        textColor: textColor,
        fontSize: fontSize.toString(),
      });
      
      const matchingTemplate = [...REFERENCE_DESIGNS, ...designs].find((d) => d.svg === imageUrl);
      if (matchingTemplate) {
        params.append("graphic", matchingTemplate.name);
      }
      
      const designLink = `${window.location.origin}/studio?${params.toString()}`;
      message += `\n\nYou can view my design mockup here:\n${designLink}`;
    }

    const waUrl = `https://wa.me/917090637746?text=${encodeURIComponent(message)}`;

    setOrderSuccess(order.id);
    setShowOrderModal(false);
    setShippingName("");
    setShippingAddress("");
    setShippingPhone("");

    // Open WhatsApp directly
    window.open(waUrl, "_blank");
  };

  return (
    <PageShell>
      <section className="border-b border-brand-black/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Design Studio
            </span>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
              Build your shirt
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 border border-brand-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-black/60 hover:text-brand-black hover:border-brand-black"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              type="button"
              onClick={handleShareDesign}
              className="inline-flex items-center gap-2 border border-brand-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-black hover:border-brand-black hover:bg-brand-gray"
            >
              <Share2 className="h-4 w-4" /> {shareSuccess ? "Link Copied!" : "Share"}
            </button>
            <button
              type="button"
              onClick={handleSaveDesign}
              className="inline-flex items-center gap-2 border border-brand-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-black hover:border-brand-black hover:bg-brand-gray"
            >
              <Save className="h-4 w-4 text-brand-orange" /> {saveSuccess ? "Saved!" : "Save Design"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  alert("Please log in as a customer to order your custom apparel.");
                  navigate({ to: "/login" });
                  return;
                }
                setShowOrderModal(true);
              }}
              className="inline-flex items-center gap-2 bg-brand-orange px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" /> Order - ${totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px]">
          {/* Canvas */}
          <div className="overflow-hidden rounded-3xl border border-brand-black/5 bg-brand-gray">
            <div className="flex items-center justify-between border-b border-brand-black/5 bg-white px-6 py-3">
              <div className="flex gap-2">
                <div className="size-3 rounded-full bg-red-400" />
                <div className="size-3 rounded-full bg-yellow-400" />
                <div className="size-3 rounded-full bg-green-400" />
              </div>
              <div className="flex overflow-hidden rounded-full border border-brand-black/10">
                {(["front", "back"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                      view === v ? "bg-brand-black text-white" : "text-brand-black/60"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                {shirt.name}
              </span>
            </div>

            <div className="relative grid min-h-[560px] place-items-center p-8 studio-dot-grid">
              {/* Shirt mockup with color tint */}
              <div className="relative aspect-[5/6] w-full max-w-[480px] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                <div
                  className="absolute inset-0"
                  style={{
                    background: shirt.value,
                    maskImage: `url(${view === "front" ? teeFront : teeBack})`,
                    WebkitMaskImage: `url(${view === "front" ? teeFront : teeBack})`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
                {/* Print area */}
                <div className="absolute left-1/2 top-[34%] flex w-[42%] -translate-x-1/2 flex-col items-center gap-3">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Uploaded design"
                      style={{ width: imageSize, height: "auto" }}
                      className="select-none"
                      draggable={false}
                    />
                  )}
                  {text && (
                    <span
                      className="text-center font-bold leading-tight"
                      style={{
                        fontFamily: font,
                        fontSize,
                        color: textColor,
                        textShadow: "0 1px 0 rgba(0,0,0,0.04)",
                      }}
                    >
                      {text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <aside className="space-y-8">
            <Panel title="Select Apparel Blank">
              {/* Category selector pills */}
              <div className="flex flex-wrap gap-1.5 pb-2.5 border-b border-brand-black/5 mb-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all duration-200 border ${
                      selectedCategory === cat
                        ? "bg-brand-black text-white border-brand-black shadow-sm"
                        : "border-brand-black/10 text-brand-black/60 hover:border-brand-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Category products grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {studioProducts
                  .filter((p) => p.category === selectedCategory)
                  .map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProduct(prod)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                        selectedProduct.id === prod.id
                          ? "border-brand-orange bg-brand-orange/5"
                          : "border-brand-black/10 hover:border-brand-black"
                      }`}
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-neutral-50 flex items-center justify-center p-1">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-[8px] font-extrabold uppercase tracking-wider truncate w-full text-brand-black/80">
                        {prod.name}
                      </span>
                      <span className="text-[9px] font-extrabold text-brand-orange">
                        ${prod.price}
                      </span>
                    </button>
                  ))}
              </div>
            </Panel>

            <Panel title="Garment color">
              <div className="flex flex-wrap gap-2">
                {selectedProduct.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setShirt({
                      name: COLOR_NAMES[c] || "Custom Color",
                      value: c,
                      text: getContrastColor(c)
                    })}
                    aria-label={COLOR_NAMES[c] || "Color"}
                    className={`size-10 rounded-full border-2 ${
                      shirt.value === c ? "border-brand-orange" : "border-brand-black/10"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Panel>

            <Panel title="Upload artwork">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 border-2 border-dashed border-brand-black/20 px-4 py-6 text-xs font-bold uppercase tracking-widest hover:border-brand-orange hover:text-brand-orange"
              >
                <Upload className="h-4 w-4" />
                {imageUrl ? "Replace image" : "Choose file"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              {imageUrl && (
                <div className="mt-4 space-y-3">
                  {/* Uploaded Photo Preview Box */}
                  <div className="p-3 border border-brand-black/5 bg-brand-gray/30 rounded-2xl flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1 border border-brand-black/10 shrink-0">
                      <img src={imageUrl} alt="Uploaded graphic" className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-black/80 truncate">Uploaded Photo</p>
                      <p className="text-[9px] text-brand-black/40 uppercase">Saved as PDF for manufacturing</p>
                    </div>
                  </div>

                  <RangeRow
                    label={`Image size: ${imageSize}px`}
                    value={imageSize}
                    min={60}
                    max={320}
                    onChange={setImageSize}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-black/60 hover:text-brand-orange"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove image
                  </button>
                </div>
              )}
            </Panel>

            <Panel title="Reference Designs">
              <p className="mb-3 text-[10px] leading-relaxed text-brand-black/50 uppercase tracking-wider">
                Select a premium graphic to overlay on your design area:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {designs.map((design) => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      setImageUrl(design.svg);
                      if (imageSize < 120) {
                        setImageSize(180);
                      }
                    }}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 text-center transition-all ${
                      imageUrl === design.svg
                        ? "border-brand-orange bg-brand-orange/5"
                        : "border-brand-black/10 hover:border-brand-black"
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-50 p-1.5 flex items-center justify-center">
                      <img
                        src={design.svg}
                        alt={design.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-black/70">
                      {design.name}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title={<><Type className="mr-2 inline h-4 w-4" />Text</>}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={40}
                placeholder="Your text"
                className="w-full border border-brand-black/15 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFont(f.value)}
                    style={{ fontFamily: f.value }}
                    className={`border px-3 py-2 text-sm ${
                      font === f.value
                        ? "border-brand-black bg-brand-black text-white"
                        : "border-brand-black/15"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <RangeRow
                  label={`Size: ${fontSize}px`}
                  value={fontSize}
                  min={14}
                  max={84}
                  onChange={setFontSize}
                />
              </div>
              <div className="mt-4">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-brand-black/60">
                  Text color
                </span>
                <div className="flex flex-wrap gap-2">
                  {["#0A0A0A", "#FFFFFF", "#FF5F1F", "#1F2A44", "#7F1D1D", "#F5EFE0"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTextColor(c)}
                      aria-label={`Text color ${c}`}
                      className={`size-8 rounded-full border-2 ${
                        textColor === c ? "border-brand-orange" : "border-brand-black/10"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </Panel>

            {/* Pricing Calculator Panel */}
            <Panel title="Pricing Calculator">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-brand-black/60">
                  <span>Base Blank:</span>
                  <span className="font-bold text-brand-black">${basePrice.toFixed(2)}</span>
                </div>
                {hasCustomText && (
                  <div className="flex justify-between text-brand-black/60">
                    <span>Text Printing Fee:</span>
                    <span className="font-bold text-brand-black">+$2.00</span>
                  </div>
                )}
                {hasCustomGraphic && (
                  <div className="flex justify-between text-brand-black/60">
                    <span>Graphic Printing Fee:</span>
                    <span className="font-bold text-brand-black">+$3.50</span>
                  </div>
                )}
                <div className="border-t border-brand-black/5 pt-2.5 flex justify-between font-display text-sm font-bold text-brand-orange mt-2">
                  <span>Total Estimated Rate:</span>
                  <span className="text-base font-extrabold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </Panel>
          </aside>
        </div>
      </section>

      {/* Order Dialog Modal Overlay */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-black/5 bg-white p-8 shadow-2xl animate-fade-in">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-brand-black">Complete Your Order</h2>
            <p className="mt-1 text-xs text-brand-black/50">
              Garment: <span className="font-bold">{selectedProduct.name}</span> (Color: {shirt.name}, Price: ${selectedProduct.price})
            </p>
            
            <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60">Shipping Name</span>
                <input
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-brand-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60">Shipping Address</span>
                <textarea
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="123 Creative Street, Apt 4B, New York, NY 10001"
                  rows={3}
                  className="w-full rounded-xl border border-brand-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-orange"
                />
              </label>
              
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60">Phone Number</span>
                <input
                  required
                  type="tel"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  placeholder="555-0199"
                  className="w-full rounded-xl border border-brand-black/10 px-4 py-2.5 text-sm outline-none focus:border-brand-orange"
                />
              </label>

              {/* Rate Summary */}
              <div className="flex justify-between items-center bg-brand-gray p-4 rounded-2xl border border-brand-black/5 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/50">Total Rate</span>
                <span className="font-display text-lg font-extrabold text-brand-orange">${selectedProduct.price.toFixed(2)}</span>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 border-t border-brand-black/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="border border-brand-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-black/60 hover:text-brand-orange"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-orange shadow-brand transition hover:-translate-y-0.5"
                >
                  Confirm Order - ${selectedProduct.price.toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal Overlay */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm text-center rounded-3xl border border-brand-black/5 bg-white p-8 shadow-2xl animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-xl">
              ✓
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-brand-black">Order Placed!</h2>
            <p className="mt-2 text-sm text-brand-black/60">
              Your order has been recorded successfully and we have redirected you to WhatsApp to chat with the owner.
            </p>
            <div className="mt-3 rounded-lg bg-brand-gray p-3 text-xs font-bold text-brand-black/70">
              Order ID: {orderSuccess}
            </div>
            <button
              type="button"
              onClick={() => {
                setOrderSuccess(null);
                reset();
              }}
              className="mt-6 w-full bg-brand-black py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-orange"
            >
              Design Another
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Panel({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-brand-black/5 bg-white p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-black/70">
        {title}
      </h3>
      {children}
    </section>
  );
}

function RangeRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-brand-black/60">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-orange"
      />
    </label>
  );
}


