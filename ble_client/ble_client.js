document.getElementById('discoverBtn').addEventListener('click', function() {
    if (typeof onDiscoverClick === 'function') {
    onDiscoverClick();
    }
});

const outputBox = document.getElementById('outputBox');


async function onDiscoverClick(event) {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['generic_access', '00000001-8c26-476f-89a7-a108033a69c7'] // Add more services if needed
        });
        const deviceInfo = `Discovered device: ${device.name || 'Unnamed'}<br>ID: ${device.id}`;
        outputBox.innerHTML = deviceInfo;
        console.log('Discovered device:', device.name || 'Unnamed', device);

        const server = await device.gatt.connect();
        // To specify a custom UUID, use its 128-bit string format (lowercase, with hyphens), e.g.:
        // '12345678-1234-5678-1234-56789abcdef0'
        // Service names are not directly available via the Web Bluetooth API.
        // Only UUIDs are provided. You can map known UUIDs to names manually if needed.
        // Example mapping:
        const serviceNames = {
            'generic_access': 'Generic Access',
            '00001800-0000-1000-8000-00805f9b34fb': 'Generic Access',
            '00000001-8c26-476f-89a7-a108033a69c7': 'ESP Throughput Service'
            // Add more UUID-to-name mappings as needed
        };
        // optionalServices: ['generic_access', '12345678-1234-5678-1234-56789abcdef0']
        const service = await server.getPrimaryService('generic_access');
        const characteristics = await service.getCharacteristics();

        let charInfo = '<br><br>All Services:<ul>';
        const propertyNames = [
            'broadcast', 'read', 'writeWithoutResponse', 'write',
            'notify', 'indicate', 'authenticatedSignedWrites',
            'reliableWrite', 'writableAuxiliaries'
        ];

        const allServices = await server.getPrimaryServices();
        for (const svc of allServices) {
            charInfo += `<li>Service UUID: ${svc.uuid}<br>`;
            const svcName = serviceNames[svc.uuid] || serviceNames[svc.uuid.toLowerCase()] || '';
            if (svcName) {
                charInfo += `Service Name: ${svcName}<br>`;
            }
            charInfo += '<ul>';
            const chars = await svc.getCharacteristics();
            for (const char of chars) {
                const props = propertyNames
                    .filter(prop => char.properties[prop])
                    .join(', ');
                charInfo += `<li>Characteristic UUID: ${char.uuid} <br>Properties: ${props || 'None'}</li>`;
            }
            charInfo += '</ul></li>';
        }
        charInfo += '</ul>';

        outputBox.innerHTML += charInfo;
    } catch (error) {
        outputBox.innerHTML = `Bluetooth discovery failed: ${error}`;
        console.error('Bluetooth discovery failed:', error);
    }
}
