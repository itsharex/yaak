import { open } from '@tauri-apps/plugin-shell';
import { useLicense } from '@yaakapp-internal/license';
import classNames from 'classnames';
import { format, formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { useCopy } from '../../hooks/useCopy';
import { useSettings } from '../../hooks/useSettings';
import { useTimedBoolean } from '../../hooks/useTimedBoolean';
import { useToggle } from '../../hooks/useToggle';
import { Banner } from '../core/Banner';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';
import { InlineCode } from '../core/InlineCode';
import { Link } from '../core/Link';
import { PlainInput } from '../core/PlainInput';
import { HStack, VStack } from '../core/Stacks';

export function SettingsLicense() {
  const { check, activate } = useLicense();
  const [key, setKey] = useState<string>('');
  const [activateFormVisible, toggleActivateFormVisible] = useToggle(false);
  const settings = useSettings();
  const specialAnnouncement =
    settings.createdAt < '2024-12-03' && check.data?.type !== 'commercial_use';
  const [copied, setCopied] = useTimedBoolean();
  const copy = useCopy({ disableToast: true });

  return (
    <div className="flex flex-col gap-6">
      {check.data?.type === 'personal_use' && <Banner color="info">You&apos;re</Banner>}
      {check.data?.type === 'commercial_use' && (
        <Banner color="success">
          <strong>License active!</strong> Enjoy using Yaak for commercial use.
        </Banner>
      )}
      {check.data?.type === 'trialing' && (
        <Banner color="success">
          <strong>Your trial ends in {formatDistanceToNow(check.data.end)}</strong>. If you&apos;re
          using Yaak for commercial use, please purchase a commercial use license.
        </Banner>
      )}
      {check.data?.type === 'trial_ended' && !specialAnnouncement && (
        <Banner color="primary">
          <strong>Your trial ended on {format(check.data.end, 'MMMM dd, yyyy')}</strong>. A
          commercial-use license is required if you use Yaak within a for-profit organization of two
          or more people.
        </Banner>
      )}

      {check.error && <Banner color="danger">{check.error}</Banner>}
      {activate.error && <Banner color="danger">{activate.error}</Banner>}

      {specialAnnouncement && (
        <VStack className="max-w-lg" space={4}>
          <p>
            <strong>Thank you for being an early supporter of Yaak!</strong>
          </p>
          <p>
            To support the ongoing development of the best local-first API client, Yaak now requires
            a paid license for the commercial use of prebuilt binaries (personal use and running the
            open-source code remains free.)
          </p>
          <p>
            For details, see the{' '}
            <Link href="https://yaak.app/blog/commercial-use">Announcement Post</Link>.
          </p>
          <p>
            As a thank-you, enter code{' '}
            <button
              title="Copy coupon code"
              className="hover:text-notice"
              onClick={() => {
                setCopied();
                copy('EARLYAAK');
              }}
            >
              <InlineCode className="inline-flex items-center gap-1">
                EARLYAAK{' '}
                <Icon
                  icon={copied ? 'check' : 'copy'}
                  size="xs"
                  className={classNames(copied && 'text-success')}
                />
              </InlineCode>
            </button>{' '}
            at checkout for 50% off your first year of the individual plan.
          </p>
          <p>~ Greg</p>
        </VStack>
      )}

      {check.data?.type === 'commercial_use' ? (
        <HStack space={2}>
          <Button variant="border" color="secondary" size="sm" onClick={toggleActivateFormVisible}>
            Activate Another License
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() => open('https://yaak.app/dashboard')}
            rightSlot={<Icon icon="external_link" />}
          >
            Direct Support
          </Button>
        </HStack>
      ) : (
        <HStack space={2}>
          <Button
            color="secondary"
            size="sm"
            onClick={() => open('https://yaak.app/pricing')}
            rightSlot={<Icon icon="external_link" />}
          >
            Purchase
          </Button>
          <Button color="primary" size="sm" onClick={toggleActivateFormVisible}>
            Activate License
          </Button>
        </HStack>
      )}

      {activateFormVisible && (
        <VStack
          as="form"
          space={3}
          className="max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            toggleActivateFormVisible();
            activate.mutate({ licenseKey: key });
          }}
        >
          <PlainInput
            autoFocus
            label="License Key"
            name="key"
            onChange={setKey}
            placeholder="YK1-XXXXX-XXXXX-XXXXX-XXXXX"
          />
          <Button type="submit" color="primary" size="sm" isLoading={activate.isPending}>
            Submit
          </Button>
        </VStack>
      )}
    </div>
  );
}
