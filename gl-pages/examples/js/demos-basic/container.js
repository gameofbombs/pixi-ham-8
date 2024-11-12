import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () =>
{
    // Create a new application
    const app = new Application();

    Assets.loader.parsers[0].config.preferWorkers = false
    Assets.crossOrigin = 'anonymous'

    // Initialize the application
    await app.init({ hello: true, background: '#1099bb', resizeTo: window });

    console.log(Assets)

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Create and add a container to the stage
    const container = new Container();

    app.stage.addChild(container);

    // Load the bunny texture
    Assets.addBundle('bundle', [{
        alias: 'bunny',
        src: 'examples/assets/bunny.png'
    }])
    const resources = await Assets.loadBundle('bundle');
    console.log('1234')
    const texture = resources.bunny
    // Create a 5x5 grid of bunnies in the container
    for (let i = 0; i < 25; i++)
    {
        const bunny = new Sprite(texture);

        bunny.x = (i % 5) * 40;
        bunny.y = Math.floor(i / 5) * 40;
        container.addChild(bunny);
    }

    // Move the container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    // Center the bunny sprites in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    // Listen for animate update
    app.ticker.add((time) =>
    {
        // Continuously rotate the container!
        // * use delta to create frame-independent transform *
        container.rotation -= 0.01 * time.deltaTime;
    });
})();
