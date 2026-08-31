from pathlib import Path
import cv2
import numpy as np

source = cv2.imread('/home/ubuntu/upload/ChatGPTImageAug28,2026,10_09_13PM.png', cv2.IMREAD_COLOR)
x_edges = [112, 234, 356, 478, 600, 723, 845, 967, 1089, 1211, 1334]
y_edges = [35, 182, 330, 477, 623, 758, 903]
for side_index, side in enumerate(('front', 'back')):
    x0, x1 = x_edges[8 + side_index] + 4, x_edges[9 + side_index] - 4
    y0, y1 = y_edges[5] + 4, y_edges[6] - 4
    crop = source[y0:y1, x0:x1]
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    print(side, 'shape', crop.shape, 'corner', gray[2,2], 'minmax', int(gray.min()), int(gray.max()))
    for y, x in [(0.3,0.1),(0.5,0.1),(0.7,0.1),(0.3,0.5),(0.5,0.5),(0.7,0.5),(0.5,0.9)]:
        print((round(y,2),round(x,2)), int(gray[int(y*gray.shape[0]),int(x*gray.shape[1])]))
