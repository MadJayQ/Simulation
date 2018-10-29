import json
import pandas as pd
from statsmodels.formula.api import ols
import numpy as np
import matplotlib
matplotlib.use('pdf')
import matplotlib.pyplot as plt

'''
ts = pd.Series(np.random.randn(1000), index=pd.date_range('1/1/2000', periods=1000))
ts = ts.cumsum()
ts.plot()
plt.savefig('test.pdf') 
'''
finaldata = {
    'totalBudget': [0, 1000, 5000, 10000, 25000],
    'coverage': [48, 74, 84, 72, 71],
};
df = pd.DataFrame(data=finaldata)
df.plot(x='totalBudget', y='coverage', rot=0)
plt.savefig('coverage.pdf')
