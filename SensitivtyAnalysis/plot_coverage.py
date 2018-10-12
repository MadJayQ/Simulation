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
    'totalBudget': [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000],
    'coverage': [40, 58, 60, 58, 63, 59, 60, 58, 63, 63, 68, 73, 68, 66, 65, 68],
};
df = pd.DataFrame(data=finaldata)
df.plot(x='totalBudget', y='coverage', rot=0)
plt.savefig('coverage.pdf')
