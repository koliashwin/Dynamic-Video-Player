VIDEO_STRUCTURE = [
    {
        'id': 'intro',
        'title': 'intro',
        'type': 'single',
        'clips': [
            {
                'id': 'intor-main',
                'title': 'Introduction',
                'url': 'http://localhost:8000/videos/intro.mp4',
                'duration': 5
            }
        ]
    },
    {
        'id': 'projects',
        'title': 'projects',
        'type': 'choice',
        'clips': [
            {
                'id': 'project-a',
                'title': 'Project-A',
                'url': 'http://localhost:8000/videos/example1.mp4',
                'duration': 10
            },
            {
                'id': 'project-b',
                'title': 'Project-B',
                'url': 'http://localhost:8000/videos/example2.mp4',
                'duration': 6

            }
        ]
    },
    {
        'id': 'examples',
        'title': 'examples',
        'type': 'random',
        'clips': [
            {
                'id': 'example-a',
                'title': 'Example-A',
                'url': 'http://localhost:8000/videos/example1.mp4',
                'duration': 10
            },
            {
                'id': 'example-b',
                'title': 'Example-B',
                'url': 'http://localhost:8000/videos/example2.mp4',
                'duration': 6
            }
        ]
    },
    {
        'id': 'outro',
        'title': 'outro',
        'type': 'single',
        'clips': [
            {
                'id': 'outro-main',
                'title': 'Outro',
                'url': 'http://localhost:8000/videos/outro.mp4',
                'duration': 4
            }
        ]
    },
    
]