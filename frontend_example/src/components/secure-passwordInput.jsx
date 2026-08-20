/// Referece: https://v7.mantine.dev/core/password-input/#strength-meter-example

import { useState, useEffect } from 'react';
import { Icons } from '../icons';

import { PasswordInput, Progress, Text, Popover, Box } from '@mantine/core';

function PasswordRequirement({ meets, label }) {
    return (
        <Box
            c={meets ? 'teal' : 'red'}
            style={{ display: 'flex', alignItems: 'center', marginTop: 7, fontSize: '0.875rem' }}
        >
            {meets ? <Icons.PasswordCheck size={14} /> : <Icons.PasswordX size={14} />}
            <Box ml={10}>{label}</Box>
        </Box>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

const SecurePasswordInput = ({
    value,
    onChange,
    error,
    labelProps,
    setAccepted,
    ...props
}) => {

    const meetsLength = value.length > 5;
    const meetsAll = requirements.every((r) => r.re.test(value)) && meetsLength;

    useEffect(() => {
        setAccepted?.(meetsAll);
    }, [value, setAccepted, meetsAll]);

    const [popoverOpened, setPopoverOpened] = useState(false);
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
    ));

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <Popover opened={popoverOpened} position="left" width="target" transitionProps={{ transition: 'pop' }} withArrow >
            <Popover.Target>
                <div
                    onFocusCapture={() => setPopoverOpened(true)}
                    onBlurCapture={() => setPopoverOpened(false)}
                >
                    <PasswordInput
                        withAsterisk
                        label="Password"
                        placeholder="Enter your password"
                        value={value}
                        onChange={onChange}
                        error={error}
                        labelProps={labelProps}
                        {...props}
                    />
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs" />
                <PasswordRequirement label="Includes at least 6 characters" meets={value.length > 5} />
                {checks}
            </Popover.Dropdown>
        </Popover>
    );
}

export default SecurePasswordInput;
