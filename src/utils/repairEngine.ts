export interface Finding {
    id: string;
    rule: string;
    description: string;
    elementHtml?: string;
    type?: string;
}

export interface RepairChange {
    rule: string;
    description: string;
    success: boolean;
}

export interface RepairResult {
    repairedHtml: string;
    changes: RepairChange[];
    skipped: { rule: string; reason: string }[];
}

export function repairHtml(html: string, _findings: Finding[]): RepairResult {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const changes: RepairChange[] = [];
    const skipped: { rule: string; reason: string }[] = [];

    // 1. Safe Rule: Add missing lang attribute to <html> tag
    const htmlElement = doc.documentElement;
    if (!htmlElement.hasAttribute('lang')) {
        htmlElement.setAttribute('lang', 'en');
        changes.push({
            rule: 'html-has-lang',
            description: 'Added missing lang="en" to <html> element.',
            success: true,
        });
    }

    // 2. Safe Rule: Fix images missing alt attributes
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
        if (!img.hasAttribute('alt')) {
            const src = img.getAttribute('src') || '';
            if (src) {
                img.setAttribute('alt', '');
                changes.push({
                    rule: 'image-alt',
                    description: 'Added empty alt="" attribute for screen reader accessibility.',
                    success: true,
                });
            } else {
                skipped.push({
                    rule: 'image-alt',
                    reason: 'Could not safely infer image context.',
                });
            }
        }
    });

    // 3. Safe Rule: Ensure interactive elements (buttons) have accessible text
    const buttons = doc.querySelectorAll('button');
    buttons.forEach((button) => {
        if (!button.textContent?.trim() && !button.hasAttribute('aria-label')) {
            button.setAttribute('aria-label', 'Button');
            changes.push({
                rule: 'button-name',
                description: 'Added fallback aria-label to empty button.',
                success: true,
            });
        }
    });

    return {
        repairedHtml: doc.body.innerHTML,
        changes,
        skipped,
    };
}