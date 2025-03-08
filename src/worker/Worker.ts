import World from "../World";

onmessage = ({data}) => {
    const world: World = new World//deserializeKnown(data);

    let lastUpdate = Date.now();
    //let i = 0;

    while (true) {
        const now = Date.now();
        const dt = (now - lastUpdate) / 1000;
        lastUpdate = now;
        world.updateList = world.updateList.filter(i => now - i < 1000);
        world.updateList.push(now);
        world.update(dt);
        // if (i++ % 50 === 0) postMessage(serializeKnown(world));
    }
};