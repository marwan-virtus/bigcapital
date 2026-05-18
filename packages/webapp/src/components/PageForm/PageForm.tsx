import React, { FC } from 'react';
import clsx from 'classnames';
import { x, SystemProps } from '@xstyled/emotion';
import { css } from '@emotion/css';
import { Group, GroupProps } from '@/components';

interface PageFormProps extends SystemProps {
  children: React.ReactNode;
}

/**
 * Page form layout.
 * @returns {React.ReactNode}
 */
export const PageForm = ({ children, ...props }: PageFormProps) => {
  return (
    <x.div display="flex" flexDirection={'column'} overflow="hidden" {...props}>
      {children}
    </x.div>
  );
};
PageForm.displayName = 'PageFormBody';

/**
 * Page form body layout, by default the content body is scrollable.
 * @returns {React.ReactNode}
 */
const PageFormBody: FC<{ children: React.ReactNode } & SystemProps> = ({
  children,
  ...props
}) => {
  return (
    <x.div flex="1" overflow="auto" {...props}>
      {children}
    </x.div>
  );
};
PageFormBody.displayName = 'PageFormBody';

const PageFormHeader: FC<GroupProps> = ({ className, ...props }) => {
  return (
    <Group
      position="apart"
      align={'flex-start'}
      p="25px 32px"
      {...props}
      className={clsx(css(pageFormHeaderStyle), className)}
    />
  );
};

const pageFormHeaderStyle = `
  border-bottom: 1px solid var(--border-on-tier-1);
  background-color: var(--surface-tier-1);
`;

/**
 * Page form footer.
 * @returns {React.ReactNode}
 */
const PageFormFooter: FC<{ children: React.ReactNode } & SystemProps> = ({
  children,
}) => {
  return <x.div>{children} </x.div>;
};

PageFormFooter.displayName = 'PageFormFooter';

const footerActionsStyle = `
  width: 100%;
  background: var(--surface-tier-1);
  padding: 14px 20px;
  border-top: 1px solid var(--border-on-tier-1);
  box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.05);

  .bp4-button-group{
    .bp4-button{
      &:not(:last-child),
      &.bp4-popover-wrapper:not(:last-child) {
        border-right: 1px solid rgba(92, 112, 127, 0.3);
        margin-right: 0;

        &.bp4-intent-primary{
          border-right: 1px solid rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
`;

const PageFormFooterActions: FC<GroupProps> = ({
  children,
  className,
  ...restProps
}) => {
  return (
    <Group
      spacing={20}
      {...restProps}
      className={clsx(css(footerActionsStyle), className)}
    >
      {children}
    </Group>
  );
};
PageFormFooterActions.displayName = 'PageFormFooterActions';

PageForm.Body = PageFormBody;
PageForm.Footer = PageFormFooter;
PageForm.FooterActions = PageFormFooterActions;
PageForm.Header = PageFormHeader;
