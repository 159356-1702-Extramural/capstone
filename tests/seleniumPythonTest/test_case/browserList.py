__author__ = 'QSG'
def browsers():
    return [
        # {'browserName':'chrome'},
        {'platform':'Windows 10',
            'browserName':'chrome'}
    ]
    # return [
    #         {"platform": "Mac OS X 10.9",
    #         "browserName": "chrome",
    #         "version": "31"},
    #         {"platform": "Windows 8.1",
    #         "browserName": "internet explorer",
    #         "version": "11"},
    #         {"platform": "Windows 8.1",
    #         "browserName": "firefox"},
    #         {"platform": "Windows 10",
    #         "browserName": "microsoftedge"}
    # ]

def sauceName():
    return 'fishinsea'

def sauceKey():
    return '61e702ad-a02a-4f5d-af26-70a3d30784f3'