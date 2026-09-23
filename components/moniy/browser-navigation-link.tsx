'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

type BrowserNavigationLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onClick' | 'prefetch'> & {
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function BrowserNavigationLink({ href, onClick, ...props }: BrowserNavigationLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented
          || event.button !== 0
          || event.metaKey
          || event.ctrlKey
          || event.shiftKey
          || event.altKey
        ) {
          return;
        }

        event.preventDefault();
        window.location.assign(href);
      }}
    />
  );
}
