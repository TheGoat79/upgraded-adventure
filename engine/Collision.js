/**
 * Collision.js - Collision System
 * Reusable collision detection helpers
 */

/**
 * Rectangle collision detection
 */
export function rectRectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

/**
 * Circle collision detection
 */
export function circleCircleCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle1.radius + circle2.radius;
}

/**
 * Circle vs Rectangle collision detection
 */
export function circleRectCollision(circle, rect) {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate distance from circle center to closest point
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle.radius;
}

/**
 * Point vs Rectangle collision detection
 */
export function pointRectCollision(point, rect) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

/**
 * Point vs Circle collision detection
 */
export function pointCircleCollision(point, circle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= circle.radius;
}

/**
 * Point vs Point collision detection (with tolerance)
 */
export function pointPointCollision(point1, point2, tolerance = 0) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= tolerance;
}

/**
 * Line segment vs Rectangle collision detection
 */
export function lineRectCollision(line, rect) {
    // Check if either endpoint is inside the rectangle
    if (pointRectCollision({ x: line.x1, y: line.y1 }, rect) ||
        pointRectCollision({ x: line.x2, y: line.y2 }, rect)) {
        return true;
    }
    
    // Check if line intersects any of the rectangle's edges
    const edges = [
        { x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y },
        { x1: rect.x + rect.width, y1: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height },
        { x1: rect.x + rect.width, y1: rect.y + rect.height, x2: rect.x, y2: rect.y + rect.height },
        { x1: rect.x, y1: rect.y + rect.height, x2: rect.x, y2: rect.y }
    ];
    
    for (const edge of edges) {
        if (lineLineCollision(line, edge)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Line segment vs Circle collision detection
 */
export function lineCircleCollision(line, circle) {
    // Check if either endpoint is inside the circle
    if (pointCircleCollision({ x: line.x1, y: line.y1 }, circle) ||
        pointCircleCollision({ x: line.x2, y: line.y2 }, circle)) {
        return true;
    }
    
    // Find the closest point on the line segment to the circle center
    const closest = closestPointOnLine(line, circle);
    
    // Check if that point is inside the circle
    return pointCircleCollision(closest, circle);
}

/**
 * Line segment vs Line segment collision detection
 */
export function lineLineCollision(line1, line2) {
    const denominator =
        (line2.y2 - line2.y1) * (line1.x2 - line1.x1) -
        (line2.x2 - line2.x1) * (line1.y2 - line1.y1);
    
    if (denominator === 0) {
        return false; // Lines are parallel
    }
    
    const ua =
        ((line2.x2 - line2.x1) * (line1.y1 - line2.y1) -
         (line2.y2 - line2.y1) * (line1.x1 - line2.x1)) / denominator;
    
    const ub =
        ((line1.x2 - line1.x1) * (line1.y1 - line2.y1) -
         (line1.y2 - line1.y1) * (line1.x1 - line2.x1)) / denominator;
    
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * Find the closest point on a line segment to a point
 */
export function closestPointOnLine(line, point) {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
        return { x: line.x1, y: line.y1 };
    }
    
    let t = ((point.x - line.x1) * dx + (point.y - line.y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    return {
        x: line.x1 + t * dx,
        y: line.y1 + t * dy
    };
}

/**
 * Get collision normal for circle vs rectangle
 */
export function getCircleRectCollisionNormal(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
        return { x: 0, y: -1 }; // Default normal
    }
    
    return {
        x: dx / distance,
        y: dy / distance
    };
}

/**
 * Get collision normal for circle vs circle
 */
export function getCircleCircleCollisionNormal(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
        return { x: 0, y: -1 }; // Default normal
    }
    
    return {
        x: dx / distance,
        y: dy / distance
    };
}

/**
 * Resolve circle vs rectangle collision
 */
export function resolveCircleRectCollision(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < circle.radius && distance > 0) {
        const overlap = circle.radius - distance;
        const normal = {
            x: dx / distance,
            y: dy / distance
        };
        
        circle.x += normal.x * overlap;
        circle.y += normal.y * overlap;
        
        return normal;
    }
    
    return null;
}

/**
 * Resolve circle vs circle collision
 */
export function resolveCircleCircleCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = circle1.radius + circle2.radius;
    
    if (distance < minDistance && distance > 0) {
        const overlap = (minDistance - distance) / 2;
        const normal = {
            x: dx / distance,
            y: dy / distance
        };
        
        circle1.x += normal.x * overlap;
        circle1.y += normal.y * overlap;
        circle2.x -= normal.x * overlap;
        circle2.y -= normal.y * overlap;
        
        return normal;
    }
    
    return null;
}

/**
 * Check if a rectangle is completely inside another rectangle
 */
export function rectInsideRect(inner, outer) {
    return (
        inner.x >= outer.x &&
        inner.y >= outer.y &&
        inner.x + inner.width <= outer.x + outer.width &&
        inner.y + inner.height <= outer.y + outer.height
    );
}

/**
 * Check if a point is inside a triangle
 */
export function pointInTriangle(point, triangle) {
    const { x, y } = point;
    const { x: x1, y: y1 } = triangle.p1;
    const { x: x2, y: y2 } = triangle.p2;
    const { x: x3, y: y3 } = triangle.p3;
    
    const area = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    const area1 = Math.abs((x1 - x) * (y2 - y) - (x2 - x) * (y1 - y));
    const area2 = Math.abs((x2 - x) * (y3 - y) - (x3 - x) * (y2 - y));
    const area3 = Math.abs((x3 - x) * (y1 - y) - (x1 - x) * (y3 - y));
    
    return Math.abs(area - (area1 + area2 + area3)) < 0.0001;
}

/**
 * AABB (Axis-Aligned Bounding Box) collision
 */
export function aabbCollision(aabb1, aabb2) {
    return rectRectCollision(aabb1, aabb2);
}

/**
 * Get bounding box of a circle
 */
export function getCircleBoundingBox(circle) {
    return {
        x: circle.x - circle.radius,
        y: circle.y - circle.radius,
        width: circle.radius * 2,
        height: circle.radius * 2
    };
}

/**
 * Get bounding box of a line segment
 */
export function getLineBoundingBox(line) {
    return {
        x: Math.min(line.x1, line.x2),
        y: Math.min(line.y1, line.y2),
        width: Math.abs(line.x2 - line.x1),
        height: Math.abs(line.y2 - line.y1)
    };
}

/**
 * Check if two bounding boxes overlap (broad phase collision)
 */
export function boundingBoxOverlap(bbox1, bbox2) {
    return rectRectCollision(bbox1, bbox2);
}

/**
 * Ray casting for point in polygon
 */
export function pointInPolygon(point, polygon) {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        if (((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
}
